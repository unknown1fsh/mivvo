import express from 'express';
import {
  startEngineSoundAnalysis,
  getEngineSoundAnalysisResult,
  getEngineSoundAnalysisHistory,
  downloadEngineSoundAnalysisReport,
  checkEngineSoundAnalysisStatus,
  audioUpload
} from '../controllers/engineSoundAnalysisController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Tüm route'lar korumalı
router.use(authenticate);

// Motor sesi analizi endpoint'leri
router.post('/analyze', audioUpload.array('audioFiles', 5), startEngineSoundAnalysis);
router.get('/history', getEngineSoundAnalysisHistory);
router.get('/:reportId', getEngineSoundAnalysisResult);
router.get('/:reportId/download', downloadEngineSoundAnalysisReport);
router.get('/:reportId/status', checkEngineSoundAnalysisStatus);

export default router;
