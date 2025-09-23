import express from 'express';
import { DamageAnalysisController, upload } from '../controllers/damageAnalysisController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gerekli
router.use(authenticate);

// Hasar analizi başlat
router.post('/start', DamageAnalysisController.startAnalysis);

// Resim yükleme (çoklu dosya)
router.post('/:reportId/upload', upload.array('images', 10), DamageAnalysisController.uploadImages);

// Hasar analizi gerçekleştir
router.post('/:reportId/analyze', DamageAnalysisController.performAnalysis);

// Hasar analizi raporu getir
router.get('/:reportId', DamageAnalysisController.getReport);

export default router;
