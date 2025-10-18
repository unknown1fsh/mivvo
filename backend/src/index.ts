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

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001; // Railway için PORT kullan

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
        'mivvo.railway.internal'
      ];
      const isAllowedDomain = origin && allowedDomains.some(domain => origin.includes(domain));
      
      if (isRailway || isVercel || isAllowedDomain || !origin) {
        console.log('✅ CORS izni verildi:', origin);
        callback(null, true);
      } else {
        console.log('❌ CORS reddedildi:', origin);
        callback(new Error('CORS policy violation'));
      }
    } else {
      // Development'ta localhost'a izin ver
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
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

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint - API prefix ile
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

// Reports endpoint - frontend için alias
app.use('/api/reports', userRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mivvo Expertiz Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
