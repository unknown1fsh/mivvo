import express from 'express';
import {
  testAIStatus,
  testPaintAnalysis,
  testDamageDetection,
  testEngineSoundAnalysis,
  testOpenAIVision,
  comprehensiveAITest
} from '../controllers/aiTestController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Tüm route'lar korumalı
router.use(authenticate);

// AI Test Route'ları
router.get('/status', testAIStatus);
router.post('/paint', testPaintAnalysis);
router.post('/damage', testDamageDetection);
router.post('/engine', testEngineSoundAnalysis);
router.post('/openai', testOpenAIVision);
router.post('/comprehensive', comprehensiveAITest);

export default router;
