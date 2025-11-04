import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import vehicleRoutes from './routes/vehicle';
import paymentRoutes from './routes/payment';
import adminRoutes from './routes/admin';
import vinRoutes from './routes/vin';
import paintAnalysisRoutes from './routes/paintAnalysis';
import engineSoundAnalysisRoutes from './routes/engineSoundAnalysis';
import vehicleGarageRoutes from './routes/vehicleGarage';
import aiAnalysisRoutes from './routes/aiAnalysis';
import aiTestRoutes from './routes/aiTest';
import damageAnalysisRoutes from './routes/damageAnalysis';
import valueEstimationRoutes from './routes/valueEstimation';
import comprehensiveExpertiseRoutes from './routes/comprehensiveExpertise';
import notificationRoutes from './routes/notifications';
import pricingRoutes from './routes/pricing';
import contactRoutes from './routes/contact';
import careerRoutes from './routes/career';
import reportRoutes from './routes/report';
import supportRoutes from './routes/supportRoutes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestLogger } from './middleware/requestLogger';
import { databaseLoggerMiddleware } from './middleware/databaseLogger';
import { getPrismaClient, disconnectPrisma } from './utils/prisma';

// Load environment variables
dotenv.config();

// Force set OpenAI API key if not set
if (!process.env.OPENAI_API_KEY) {
  console.log('[WARN] OpenAI API Key not found in .env');
  console.log('[WARN] Get API Key: https://platform.openai.com/account/api-keys');
}

const app = express();
// Railway'de otomatik port kullan (ayrı servis için)
const PORT = process.env.PORT || 3001;

// Trust proxy for production deployments
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
// Test ortamında rate limiting'i devre dışı bırak
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => {
      // X-Forwarded-For header'ını kullan (production deployments için)
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
  });
  app.use(limiter);
}

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Production ortamında origin kontrolü
    if (process.env.NODE_ENV === 'production') {
      // Railway production'da tüm origin'lere izin ver
      // Railway domain pattern: *.railway.app
      const isRailway = origin && origin.includes('.railway.app');
      
      // Spesifik Railway domain kontrolü
      const allowedDomains = [
        'mivvo-production.up.railway.app',
        'mivvo.railway.internal',
        'www.mivvo.org',
        'mivvo.org',
        'mivvo.up.railway.app',
        'fulfilling-adventure.up.railway.app',
        'enchanting-flow-production.up.railway.app'
      ];
      const isAllowedDomain = origin && allowedDomains.some(domain => origin.includes(domain));
      
      // Railway internal requests için origin undefined olabilir
      if (isRailway || isAllowedDomain || !origin) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'));
      }
    } else {
      // Development'ta tüm localhost'lara izin ver
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Timeout middleware for AI analysis
app.use((req, res, next) => {
  // AI analizi için 10 dakika timeout
  if (req.path.includes('/damage-analysis') || req.path.includes('/ai-analysis')) {
    req.setTimeout(600000); // 10 dakika
    res.setTimeout(600000); // 10 dakika
  }
  next();
});

// Logging middleware - Winston ile entegre
app.use(requestLogger);

// Health check endpoint - API prefix ile (catch-all'dan önce!)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    port: PORT,
    service: 'mivvo-backend'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vin', vinRoutes);
app.use('/api/paint-analysis', paintAnalysisRoutes);
app.use('/api/engine-sound-analysis', engineSoundAnalysisRoutes);
app.use('/api/vehicle-garage', vehicleGarageRoutes);
app.use('/api/ai-analysis', aiAnalysisRoutes);
app.use('/api/ai-test', aiTestRoutes);
app.use('/api/damage-analysis', damageAnalysisRoutes);
app.use('/api/value-estimation', valueEstimationRoutes);
app.use('/api/comprehensive-expertise', comprehensiveExpertiseRoutes);
app.use('/api/user/notifications', notificationRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/career', careerRoutes);

// Reports endpoint - yeni report controller
app.use('/api/reports', reportRoutes);

// Support endpoint
app.use('/api/support', supportRoutes);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Prisma Client ve Database Logger Setup
const prisma = getPrismaClient();

// Production'da sadece error logları kullan
if (process.env.NODE_ENV === 'production') {
  // Production'da database logger'ı devre dışı bırak (kota tasarrufu için)
} else {
  prisma.$use(databaseLoggerMiddleware);
}

// Start server (only if not in test environment)
let server: any = null;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│     🚀 MIVVO EXPERTIZ - BACKEND SERVER BAŞLATILIYOR        │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log(`\n📡 Sunucu Durumu:`);
    console.log(`   ✓ Backend sunucusu başarıyla başlatıldı`);
    console.log(`   ✓ Port: ${PORT}`);
    console.log(`   ✓ Ortam: ${process.env.NODE_ENV === 'production' ? 'Üretim' : 'Geliştirme'}`);
    console.log(`   ✓ Sağlık kontrolü: http://localhost:${PORT}/api/health`);
    
    console.log(`\n🔌 Aktif API Route'ları:`);
    console.log(`   • /api/auth - Kullanıcı kimlik doğrulama`);
    console.log(`   • /api/user - Kullanıcı işlemleri`);
    console.log(`   • /api/vehicle - Araç raporları`);
    console.log(`   • /api/payment - Ödeme işlemleri`);
    console.log(`   • /api/admin - Yönetici paneli`);
    console.log(`   • /api/damage-analysis - Hasar analizi`);
    console.log(`   • /api/paint-analysis - Boya analizi`);
    console.log(`   • /api/engine-sound - Motor sesi analizi`);
    console.log(`   • /api/comprehensive-expertise - Kapsamlı ekspertiz`);
    
    console.log(`\n🗄️  Veritabanı:`);
    console.log(`   ${process.env.NODE_ENV === 'production' ? '⚠️  Production: Database logger kapatıldı' : '✓ Database logger aktif'}`);
    
    console.log(`\n📊 Loglama Sistemi:`);
    console.log(`   ✓ HTTP istekleri loglanıyor`);
    console.log(`   ${process.env.NODE_ENV === 'production' ? '⚠️  Production: Sadece hata logları' : '✓ Tüm loglar aktif'}`);
    
    console.log(`\n✨ Sunucu hazır ve istek almaya başladı!\n`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log('\n');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                  ⏸️  SUNUCU KAPATILIYOR                    │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log('⏳ İşlemler tamamlanıyor...\n');
    
    console.log('   1️⃣  HTTP sunucusu kapatılıyor...');
    if (server) {
      server.close(async () => {
        console.log('   ✓ HTTP sunucusu kapatıldı');
        
        console.log('   2️⃣  Veritabanı bağlantısı kesiliyor...');
        await disconnectPrisma();
        console.log('   ✓ Veritabanı bağlantısı kesildi');
        
        console.log('\n   ✅ Sunucu başarıyla kapatıldı!');
        console.log('   👋 Görüşmek üzere...\n');
        
        process.exit(0);
      });
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
