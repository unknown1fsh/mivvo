import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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
  console.log('⚠️ OpenAI API Key bulunamadı! Lütfen .env dosyasında OPENAI_API_KEY değişkenini ayarlayın.');
  console.log('🔗 API Key almak için: https://platform.openai.com/account/api-keys');
}

const app = express();
// Railway'de otomatik port kullan (ayrı servis için)
const PORT = process.env.PORT || 8080;

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - Vercel için optimize edildi
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false,
  // Vercel için skip successful requests
  skipSuccessfulRequests: false,
  // Vercel için skip failed requests
  skipFailedRequests: false,
  // Vercel için key generator
  keyGenerator: (req) => {
    // Vercel'de X-Forwarded-For header'ını kullan
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    console.log('🔍 CORS Origin kontrolü:', { origin, nodeEnv: process.env.NODE_ENV });
    
    // Production ortamında origin kontrolü
    if (process.env.NODE_ENV === 'production') {
      // Railway ve Vercel production'da tüm origin'lere izin ver
      // Railway domain pattern: *.railway.app
      // Vercel domain pattern: *.vercel.app
      const isRailway = origin && origin.includes('.railway.app');
      const isVercel = origin && origin.includes('.vercel.app');
      const isLocalhost = origin && origin.includes('localhost');
      
      // Spesifik Railway domain kontrolü
      const allowedDomains = [
        'mivvo-production.up.railway.app',
        'mivvo.railway.internal',
        'www.mivvo.org',
        'mivvo.org'
      ];
      const isAllowedDomain = origin && allowedDomains.some(domain => origin.includes(domain));
      
      // Railway internal requests için origin undefined olabilir
      if (isRailway || isVercel || isAllowedDomain || !origin) {
        console.log('✅ CORS izni verildi:', origin || 'undefined (internal request)');
        callback(null, true);
      } else {
        console.log('❌ CORS reddedildi:', origin);
        callback(new Error('CORS policy violation'));
      }
    } else {
      // Development'ta localhost'a izin ver
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
      if (!origin || allowedOrigins.includes(origin)) {
        console.log('✅ Development CORS izni verildi:', origin || 'undefined');
        callback(null, true);
      } else {
        console.log('❌ Development CORS reddedildi:', origin);
        callback(new Error('CORS policy violation'));
      }
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Vercel serverless functions için frontend static serving kaldırıldı
// Vercel routing ile frontend dosyaları otomatik serve ediliyor

// Prisma Client ve Database Logger Setup
const prisma = getPrismaClient();

// Production'da sadece error logları kullan
if (process.env.NODE_ENV === 'production') {
  // Production'da database logger'ı devre dışı bırak (kota tasarrufu için)
  console.log('🔧 Production modu: Database logger devre dışı');
} else {
  prisma.$use(databaseLoggerMiddleware);
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Mivvo Expertiz Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Logging: Winston + Morgan entegrasyonu aktif`);
  console.log(`🗄️ Database: Prisma middleware logger aktif`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
});

export default app;
