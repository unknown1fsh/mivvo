import express from 'express'
import { ComprehensiveExpertiseController, imageUpload, audioUpload } from '../controllers/comprehensiveExpertiseController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// Tüm rotalar için kimlik doğrulama gerekli
router.use(authenticate)

// Tam expertiz başlat
router.post('/start', ComprehensiveExpertiseController.startAnalysis)

// Resim yükleme (çoklu dosya)
router.post('/:reportId/upload-images', imageUpload.array('images', 10), ComprehensiveExpertiseController.uploadImages)

// Ses dosyası yükleme (çoklu dosya)
router.post('/:reportId/upload-audio', audioUpload.array('audioFiles', 5), ComprehensiveExpertiseController.uploadAudio)

// Tam expertiz gerçekleştir
router.post('/:reportId/analyze', ComprehensiveExpertiseController.performAnalysis)

// Tam expertiz raporu getir
router.get('/:reportId', ComprehensiveExpertiseController.getReport)

export default router
