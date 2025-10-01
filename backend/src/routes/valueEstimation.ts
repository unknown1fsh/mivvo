import express from 'express'
import { ValueEstimationController, upload } from '../controllers/valueEstimationController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// Tüm rotalar için kimlik doğrulama gerekli
router.use(authenticate)

// Değer tahmini başlat
router.post('/start', ValueEstimationController.startAnalysis)

// Resim yükleme (çoklu dosya)
router.post('/:reportId/upload', upload.array('images', 10), ValueEstimationController.uploadImages)

// Değer tahmini gerçekleştir
router.post('/:reportId/analyze', ValueEstimationController.performAnalysis)

// Değer tahmini raporu getir
router.get('/:reportId', ValueEstimationController.getReport)

export default router
