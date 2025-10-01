import express from 'express'
import { PaintAnalysisController, upload } from '../controllers/paintAnalysisController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// Tüm rotalar için kimlik doğrulama gerekli
router.use(authenticate)

// Boya analizi başlat
router.post('/start', PaintAnalysisController.startAnalysis)

// Resim yükleme (çoklu dosya)
router.post('/:reportId/upload', upload.array('images', 10), PaintAnalysisController.uploadImages)

// Boya analizi gerçekleştir
router.post('/:reportId/analyze', PaintAnalysisController.performAnalysis)

// Boya analizi raporu getir
router.get('/:reportId', PaintAnalysisController.getReport)

export default router
