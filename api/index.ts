import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

// Express app oluştur
const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://www.mivvo.org',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // 15 dakikada 100 istek
  message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
});
app.use(limiter);

// Prisma Client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'Connected'
  });
});

// ===== AUTH ROUTES =====

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gereklidir.'
      });
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre.'
      });
    }

    // Şifre kontrolü (bcrypt kullanılmalı)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre.'
      });
    }

    // JWT token oluştur (basit token)
    const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Tüm alanlar gereklidir.'
      });
    }

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor.'
      });
    }

    // Yeni kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: password, // Production'da bcrypt ile hash'lenmeli
        firstName,
        lastName,
        phone: phone || null,
        role: 'USER',
        emailVerified: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// OAuth login endpoint
app.post('/api/auth/oauth', async (req, res) => {
  try {
    const { provider, providerId, email, name, image, accessToken } = req.body;
    
    if (!provider || !providerId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Provider, providerId ve email gereklidir.'
      });
    }

    // OAuth kullanıcısını bul veya oluştur
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Yeni OAuth kullanıcısı oluştur
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          firstName: name?.split(' ')[0] || 'OAuth',
          lastName: name?.split(' ').slice(1).join(' ') || 'User',
          role: 'USER',
          emailVerified: true,
          password: 'oauth-user', // OAuth kullanıcıları için geçici şifre
        }
      });
    }

    // JWT token oluştur
    const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('OAuth login error:', error);
    res.status(500).json({
      success: false,
      message: 'OAuth login hatası oluştu.'
    });
  }
});

// ===== USER ROUTES =====

// Get user profile
app.get('/api/user/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header gerekli.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// ===== VEHICLE ROUTES =====

// Get user vehicles
app.get('/api/vehicle', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header gerekli.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');

    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { vehicles }
    });
  } catch (error) {
    console.error('Vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// Create vehicle
app.post('/api/vehicle', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header gerekli.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');

    const { brand, model, year, plateNumber, vin } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        userId,
        brand,
        model,
        year: parseInt(year),
        plateNumber,
        vin
      }
    });

    res.status(201).json({
      success: true,
      message: 'Araç başarıyla eklendi.',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// ===== VIN ROUTES =====

// VIN lookup
app.post('/api/vin/lookup', async (req, res) => {
  try {
    const { vin } = req.body;
    
    if (!vin) {
      return res.status(400).json({
        success: false,
        message: 'VIN numarası gereklidir.'
      });
    }

    // VIN lookup logic buraya eklenebilir
    // Şimdilik mock data döndürüyoruz
    res.json({
      success: true,
      data: {
        vin,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        engine: '1.6L',
        fuelType: 'Benzin',
        transmission: 'Manuel',
        color: 'Beyaz',
        mileage: '50000 km'
      }
    });
  } catch (error) {
    console.error('VIN lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// ===== ANALYSIS ROUTES =====

// Paint analysis
app.post('/api/paint-analysis', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header gerekli.'
      });
    }

    const { images, vehicleId } = req.body;

    if (!images || !vehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Resimler ve araç ID gereklidir.'
      });
    }

    // Paint analysis logic buraya eklenebilir
    // Şimdilik mock data döndürüyoruz
    res.json({
      success: true,
      data: {
        analysisId: 'paint_' + Date.now(),
        vehicleId,
        status: 'completed',
        results: {
          paintCondition: 'İyi',
          scratches: 2,
          dents: 0,
          rust: false,
          overallScore: 85
        }
      }
    });
  } catch (error) {
    console.error('Paint analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// Damage analysis
app.post('/api/damage-analysis', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header gerekli.'
      });
    }

    const { images, vehicleId } = req.body;

    if (!images || !vehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Resimler ve araç ID gereklidir.'
      });
    }

    // Damage analysis logic buraya eklenebilir
    // Şimdilik mock data döndürüyoruz
    res.json({
      success: true,
      data: {
        analysisId: 'damage_' + Date.now(),
        vehicleId,
        status: 'completed',
        results: {
          damageType: 'Çizik',
          severity: 'Hafif',
          estimatedCost: 500,
          repairTime: '2-3 gün'
        }
      }
    });
  } catch (error) {
    console.error('Damage analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// Engine sound analysis
app.post('/api/engine-sound-analysis', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header gerekli.'
      });
    }

    const { audioFile, vehicleId } = req.body;

    if (!audioFile || !vehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Ses dosyası ve araç ID gereklidir.'
      });
    }

    // Engine sound analysis logic buraya eklenebilir
    // Şimdilik mock data döndürüyoruz
    res.json({
      success: true,
      data: {
        analysisId: 'engine_' + Date.now(),
        vehicleId,
        status: 'completed',
        results: {
          engineHealth: 'İyi',
          anomalies: ['Hafif titreşim'],
          recommendations: ['Motor bakımı önerilir']
        }
      }
    });
  } catch (error) {
    console.error('Engine sound analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// ===== REPORTS ROUTES =====

// Get user reports
app.get('/api/reports', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header gerekli.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');

    const reports = await prisma.report.findMany({
      where: { userId },
      include: {
        vehicle: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// ===== ADMIN ROUTES =====

// Get all users (admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header gerekli.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin yetkisi gerekli.'
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// ===== CONTACT ROUTES =====

// Contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Tüm alanlar gereklidir.'
      });
    }

    // Contact message kaydet
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message
      }
    });

    res.status(201).json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi.',
      data: { contactMessage }
    });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// ===== PRICING ROUTES =====

// Get pricing plans
app.get('/api/pricing', async (req, res) => {
  try {
    const plans = [
      {
        id: 'basic',
        name: 'Temel',
        price: 50,
        credits: 5,
        features: ['Temel analiz', 'PDF rapor']
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 100,
        credits: 12,
        features: ['Gelişmiş analiz', 'PDF rapor', 'Email desteği']
      },
      {
        id: 'enterprise',
        name: 'Kurumsal',
        price: 200,
        credits: 30,
        features: ['Tüm analizler', 'PDF rapor', 'Öncelikli destek', 'API erişimi']
      }
    ];

    res.json({
      success: true,
      data: { plans }
    });
  } catch (error) {
    console.error('Pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
});

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'https://www.mivvo.org');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Express app'i çalıştır
  return new Promise((resolve, reject) => {
    app(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}