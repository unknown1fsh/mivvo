import express from 'express';
import {
  getVehicleGarage,
  getVehicleById,
  addVehicleToGarage,
  updateVehicle,
  deleteVehicle,
  uploadVehicleImages,
  deleteVehicleImage,
  setDefaultVehicle,
  getVehicleReports,
  upload
} from '../controllers/vehicleGarageController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Tüm route'lar korumalı
router.use(authenticate);

// Araç Garajı CRUD işlemleri
router.get('/', getVehicleGarage);
router.get('/:id', getVehicleById);
router.post('/', addVehicleToGarage);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

// Araç resim işlemleri
router.post('/:vehicleId/images', upload.array('images', 10), uploadVehicleImages);
router.delete('/:vehicleId/images/:imageId', deleteVehicleImage);

// Araç ayarları
router.patch('/:id/set-default', setDefaultVehicle);

// Araç raporları
router.get('/:id/reports', getVehicleReports);

export default router;
