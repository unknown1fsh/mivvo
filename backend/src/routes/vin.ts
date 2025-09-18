import { Router } from 'express';
import { VINController } from '../controllers/vinController';

const router = Router();

// VIN sorgulama endpoint'leri
router.post('/decode', VINController.decodeVIN);
router.get('/basic/:vin', VINController.getBasicInfo);
router.get('/history', VINController.getLookupHistory);

export default router;
