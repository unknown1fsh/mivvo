import { Router } from 'express';
import { PaintAnalysisController, upload } from '../controllers/paintAnalysisController';

const router = Router();

// Boya analizi için resim yükleme ve analiz
router.post('/analyze', upload.array('images', 10), PaintAnalysisController.analyzePaint);

// Boya analizi geçmişini getir
router.get('/history', PaintAnalysisController.getAnalysisHistory);

// Detaylı analiz raporu getir
router.get('/report/:analysisId', PaintAnalysisController.getAnalysisReport);

export default router;
