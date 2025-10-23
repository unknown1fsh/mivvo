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

// Auth routes
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

// Diğer API route'ları buraya eklenebilir...

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
