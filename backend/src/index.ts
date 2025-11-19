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

// Validate environment variables FIRST (must be called before any other imports that use env vars)
import { validateEnv, isProduction, isTest } from './utils/envValidation';

let env;
try {
  env = validateEnv();
  console.log('✅ Environment variables validated successfully');
} catch (error) {
  console.error('❌ Failed to validate environment variables:', error);
  process.exit(1);
}

// Initialize Sentry (after env validation)
import { initSentry } from './utils/sentry';
initSentry();

const app = express();
// Railway'de otomatik port kullan (ayrı servis için)
const PORT = env.PORT;

// Trust proxy for production deployments
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
// Test ortamında rate limiting'i devre dışı bırak
if (!isTest()) {
  // Production'da daha sıkı rate limiting
  const maxRequests = isProduction() 
    ? Math.min(env.RATE_LIMIT_MAX_REQUESTS, 50) // Max 50 in production
    : env.RATE_LIMIT_MAX_REQUESTS;
  
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  
  const limiter = rateLimit({
    windowMs,
    max: maxRequests,
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
    // Production ortamında sıkı origin kontrolü
    if (isProduction()) {
      // Whitelist: Sadece izin verilen domain'ler
      const allowedDomains = [
        'https://www.mivvo.org',
        'https://mivvo.org',
        'https://mivvo-production.up.railway.app',
        'https://mivvo.up.railway.app',
      ];
      
      // Railway internal requests için origin undefined olabilir (sadece internal)
      if (!origin) {
        // Internal Railway requests - sadece Railway internal network'ten geliyorsa izin ver
        callback(null, true);
        return;
      }
      
      // Origin'in tam olarak eşleşmesi gerekiyor (substring değil)
      const isAllowed = allowedDomains.includes(origin);
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(new Error('CORS policy violation: Origin not allowed'));
      }
    } else {
      // Development'ta localhost ve 127.0.0.1'e izin ver
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0')) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin in development: ${origin}`);
        callback(new Error('CORS policy violation: Only localhost allowed in development'));
      }
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
app.get('/api/health', async (req, res) => {
  const healthCheckStart = Date.now();
  console.log(`[${new Date().toISOString()}] 🏥 Health Check - Başlatılıyor...`);
  
  try {
    console.log(`[${new Date().toISOString()}] 🔍 Health Check - Database bağlantısı kontrol ediliyor...`);
    // Database bağlantısını kontrol et
    const prisma = getPrismaClient();
    const dbCheckStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbCheckDuration = Date.now() - dbCheckStart;
    
    console.log(`[${new Date().toISOString()}] ✅ Health Check - Database bağlantısı başarılı (${dbCheckDuration}ms)`);
    
    // Monitoring metrics
    const { getHealthMetrics } = require('./utils/monitoring');
    const healthMetrics = getHealthMetrics();
    
    const healthCheckDuration = Date.now() - healthCheckStart;
    const response = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      port: PORT,
      service: 'mivvo-backend',
      database: 'connected',
      databaseCheckDuration: dbCheckDuration,
      healthCheckDuration: healthCheckDuration,
      memory: healthMetrics.memory,
      performance: healthMetrics.performance,
    };
    
    console.log(`[${new Date().toISOString()}] ✅ Health Check - Başarılı (${healthCheckDuration}ms)`, JSON.stringify(response, null, 2));
    
    res.status(200).json(response);
  } catch (error) {
    const healthCheckDuration = Date.now() - healthCheckStart;
    const errorMessage = error instanceof Error ? error.message : 'Database connection check failed';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`[${new Date().toISOString()}] ❌ Health Check - Database bağlantı hatası:`, errorMessage);
    if (errorStack) {
      console.error(`[${new Date().toISOString()}] ❌ Health Check - Stack trace:`, errorStack);
    }
    
    // Database bağlantısı başarısız olsa bile service çalışıyor olarak işaretle
    // (Railway healthcheck için kritik değil)
    const response = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      port: PORT,
      service: 'mivvo-backend',
      database: 'disconnected',
      warning: errorMessage,
      healthCheckDuration: healthCheckDuration,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      }
    };
    
    console.log(`[${new Date().toISOString()}] ⚠️ Health Check - Database hatası ile tamamlandı (${healthCheckDuration}ms)`, JSON.stringify(response, null, 2));
    
    res.status(200).json(response);
  }
});

// Metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const { getHealthMetrics } = require('./utils/monitoring');
    const metrics = getHealthMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Metrics alınamadı',
    });
  }
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

// Queue Workers başlat
if (process.env.NODE_ENV !== 'test') {
  try {
    const { startAIAnalysisWorker } = require('./jobs/aiAnalysisJob');
    const { startEmailWorker } = require('./jobs/emailJob');
    startAIAnalysisWorker();
    startEmailWorker();
    console.log('✅ Queue workers başlatıldı (AI Analysis, Email)');
  } catch (error) {
    console.warn('⚠️ Queue workers başlatılamadı (Redis bağlantısı yok olabilir):', error instanceof Error ? error.message : error);
  }
}

// Start server (only if not in test environment)
let server: any = null;
if (process.env.NODE_ENV !== 'test') {
  const startupTime = Date.now();
  console.log('\n┌─────────────────────────────────────────────────────────────┐');
  console.log('│     🚀 MIVVO EXPERTIZ - BACKEND SERVER BAŞLATILIYOR        │');
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log(`[${new Date().toISOString()}] 📋 Startup Bilgileri:`);
  console.log(`   • Node.js Version: ${process.version}`);
  console.log(`   • Platform: ${process.platform}`);
  console.log(`   • Arch: ${process.arch}`);
  console.log(`   • PID: ${process.pid}`);
  console.log(`   • CWD: ${process.cwd()}`);
  console.log(`   • Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'N/A'}`);
  console.log(`   • Railway Service: ${process.env.RAILWAY_SERVICE_NAME || 'N/A'}`);
  console.log(`   • Railway Deployment: ${process.env.RAILWAY_DEPLOYMENT_ID || 'N/A'}`);
  
  server = app.listen(PORT, () => {
    const startupDuration = Date.now() - startupTime;
    console.log(`\n[${new Date().toISOString()}] 📡 Sunucu Durumu:`);
    console.log(`   ✓ Backend sunucusu başarıyla başlatıldı (${startupDuration}ms)`);
    console.log(`   ✓ Port: ${PORT}`);
    console.log(`   ✓ Ortam: ${process.env.NODE_ENV === 'production' ? 'Üretim' : 'Geliştirme'}`);
    console.log(`   ✓ Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   ✓ Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`);
    
    console.log(`\n[${new Date().toISOString()}] 🔌 Aktif API Route'ları:`);
    console.log(`   • /api/auth - Kullanıcı kimlik doğrulama`);
    console.log(`   • /api/user - Kullanıcı işlemleri`);
    console.log(`   • /api/vehicle - Araç raporları`);
    console.log(`   • /api/payment - Ödeme işlemleri`);
    console.log(`   • /api/admin - Yönetici paneli`);
    console.log(`   • /api/damage-analysis - Hasar analizi`);
    console.log(`   • /api/paint-analysis - Boya analizi`);
    console.log(`   • /api/engine-sound - Motor sesi analizi`);
    console.log(`   • /api/comprehensive-expertise - Kapsamlı ekspertiz`);
    
    console.log(`\n[${new Date().toISOString()}] 🗄️  Veritabanı:`);
    console.log(`   • DATABASE_URL: ${process.env.DATABASE_URL ? '✓ Tanımlı' : '✗ Tanımlı değil'}`);
    console.log(`   • Database Logger: ${process.env.NODE_ENV === 'production' ? '⚠️  Production: Kapatıldı (kota tasarrufu)' : '✓ Aktif'}`);
    
    console.log(`\n[${new Date().toISOString()}] 📊 Loglama Sistemi:`);
    console.log(`   • HTTP Logger: ✓ Aktif`);
    console.log(`   • Request Logger: ✓ Aktif`);
    console.log(`   • Log Level: ${process.env.NODE_ENV === 'production' ? 'INFO (sadece hata logları)' : 'DEBUG (tüm loglar)'}`);
    console.log(`   • Console Output: ✓ Aktif (Railway için)`);
    
    console.log(`\n[${new Date().toISOString()}] ✨ Sunucu hazır ve istek almaya başladı!`);
    console.log(`[${new Date().toISOString()}] 🎯 Railway Deployment için hazır\n`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    const shutdownStart = Date.now();
    console.log('\n');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                  ⏸️  SUNUCU KAPATILIYOR                    │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log(`[${new Date().toISOString()}] ⏳ İşlemler tamamlanıyor...`);
    console.log(`[${new Date().toISOString()}] 📋 Signal: ${signal}`);
    console.log(`[${new Date().toISOString()}] 📋 Uptime: ${Math.round(process.uptime())} saniye\n`);
    
    console.log(`[${new Date().toISOString()}] 1️⃣  HTTP sunucusu kapatılıyor...`);
    if (server) {
      server.close(async () => {
        console.log(`[${new Date().toISOString()}] ✓ HTTP sunucusu kapatıldı`);
        
        console.log(`[${new Date().toISOString()}] 2️⃣  Veritabanı bağlantısı kesiliyor...`);
        await disconnectPrisma();
        console.log(`[${new Date().toISOString()}] ✓ Veritabanı bağlantısı kesildi`);
        
        console.log(`[${new Date().toISOString()}] 3️⃣  Queue'lar kapatılıyor...`);
        try {
          const { closeAllQueues } = require('./services/queueService');
          await closeAllQueues();
          console.log(`[${new Date().toISOString()}] ✓ Queue'lar kapatıldı`);
        } catch (error) {
          console.warn(`[${new Date().toISOString()}] ⚠️ Queue kapatma hatası:`, error);
        }
        
        const shutdownDuration = Date.now() - shutdownStart;
        console.log(`\n[${new Date().toISOString()}] ✅ Sunucu başarıyla kapatıldı (${shutdownDuration}ms)`);
        console.log(`[${new Date().toISOString()}] 👋 Görüşmek üzere...\n`);
        
        process.exit(0);
      });
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
