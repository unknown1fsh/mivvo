import express from 'express';
import {
  advancedAIAnalysis,
  damageDetection,
  getAIStatus,
  testAIModels,
  trainAIModel,
  getAIAnalysisHistory
} from '../controllers/aiAnalysisController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Tüm route'lar korumalı
router.use(authenticate);

// AI Analiz Route'ları
router.post('/advanced', advancedAIAnalysis);
router.post('/damage-detection', damageDetection);
router.get('/status', getAIStatus);
router.post('/test', testAIModels);
router.post('/train', trainAIModel);
router.get('/history', getAIAnalysisHistory);

export default router;
