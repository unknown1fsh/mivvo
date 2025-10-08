/**
 * Vehicle Garage Routes (Araç Garajı Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, kullanıcının araç garajı yönetimi route'larını tanımlar.
 * 
 * Route Kategorileri:
 * 1. Araç CRUD:
 *    - GET / (Araç listesi)
 *    - GET /:id (Araç detayı)
 *    - POST / (Araç ekle)
 *    - PUT /:id (Araç güncelle)
 *    - DELETE /:id (Araç sil)
 * 
 * 2. Görsel Yönetimi:
 *    - POST /:vehicleId/images (Görsel yükle - Multer)
 *    - DELETE /:vehicleId/images/:imageId (Görsel sil)
 * 
 * 3. Araç Ayarları:
 *    - PATCH /:id/set-default (Varsayılan araç ayarla)
 * 
 * 4. Araç Raporları:
 *    - GET /:id/reports (Araç raporları)
 * 
 * Özellikler:
 * - Tüm route'lar authenticate middleware ile korumalı
 * - Multer ile file upload (max 10 görsel)
 * - Async error handling
 * - Sahiplik kontrolü (userId)
 */

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

// ===== AUTHENTICATION MIDDLEWARE =====

/**
 * Tüm Route'lar İçin Authentication
 * 
 * JWT authentication gereklidir.
 */
router.use(authenticate);

// ===== VEHICLE CRUD ROUTES (ARAÇ CRUD) =====

/**
 * GET /vehicle-garage
 * 
 * Kullanıcının tüm araçlarını listele.
 * 
 * Sıralama:
 * - Varsayılan araç önce (isDefault: desc)
 * - Tarih sıralı (createdAt: desc)
 * 
 * Response:
 * - vehicles: Araç listesi
 * - İçerik: Görseller ve rapor sayısı dahil
 */
router.get('/', getVehicleGarage);

/**
 * GET /vehicle-garage/:id
 * 
 * Belirli bir aracın detaylarını getir.
 * 
 * Params:
 * - id: Vehicle ID
 * 
 * Güvenlik:
 * - Sahiplik kontrolü (userId match)
 * 
 * Response:
 * - vehicle: Araç detayları
 * - vehicleImages: Görseller
 * - reports: Son 5 rapor
 */
router.get('/:id', getVehicleById);

/**
 * POST /vehicle-garage
 * 
 * Garaja yeni araç ekle.
 * 
 * Body:
 * - plate: string (zorunlu, benzersiz)
 * - brand: string
 * - model: string
 * - year: number
 * - color?: string
 * - mileage?: number
 * - vin?: string
 * - fuelType?: string
 * - transmission?: string
 * - engineSize?: string
 * - bodyType?: string
 * - doors?: number
 * - seats?: number
 * - notes?: string
 * - isDefault?: boolean
 * 
 * İş Akışı:
 * 1. Plaka benzersizliği kontrolü (kullanıcı bazında)
 * 2. Varsayılan araç ise diğerlerini kaldır
 * 3. Araç kaydı oluştur
 * 
 * Response:
 * - vehicle: Oluşturulan araç
 */
router.post('/', addVehicleToGarage);

/**
 * PUT /vehicle-garage/:id
 * 
 * Araç bilgilerini güncelle.
 * 
 * Params:
 * - id: Vehicle ID
 * 
 * Body:
 * - Güncellenecek alanlar (partial update)
 * 
 * İş Akışı:
 * 1. Araç varlık ve sahiplik kontrolü
 * 2. Plaka değişiyorsa benzersizlik kontrolü
 * 3. Varsayılan araç ise diğerlerini kaldır
 * 4. Güncelleme
 * 
 * Response:
 * - vehicle: Güncellenmiş araç
 */
router.put('/:id', updateVehicle);

/**
 * DELETE /vehicle-garage/:id
 * 
 * Aracı sil.
 * 
 * Params:
 * - id: Vehicle ID
 * 
 * İş Akışı:
 * 1. Araç varlık ve sahiplik kontrolü
 * 2. İlişkili görselleri dosya sisteminden sil
 * 3. Veritabanından sil (cascade)
 * 
 * UYARI:
 * - İlişkili veriler silinir!
 * - Geri alınamaz!
 * 
 * Response:
 * - success: true
 */
router.delete('/:id', deleteVehicle);

// ===== IMAGE MANAGEMENT ROUTES (GÖRSEL YÖNETİMİ) =====

/**
 * POST /vehicle-garage/:vehicleId/images
 * 
 * Araca görsel yükle (Multer).
 * 
 * Params:
 * - vehicleId: Vehicle ID
 * 
 * Middleware:
 * - upload.array('images', 10): Max 10 görsel
 * 
 * FormData:
 * - images: File[] (image/*)
 * 
 * Multer Config:
 * - Yükleme dizini: uploads/vehicle-garage/
 * - Max dosya boyutu: 10MB
 * - İzin verilen tipler: image/*
 * 
 * İş Akışı:
 * 1. Araç sahiplik kontrolü
 * 2. Her dosya için VehicleGarageImage kaydı
 * 3. Dosya adı: {fieldname}-{timestamp}-{random}.{ext}
 * 
 * Response:
 * - images: Yüklenen görseller
 */
router.post('/:vehicleId/images', upload.array('images', 10), uploadVehicleImages);

/**
 * DELETE /vehicle-garage/:vehicleId/images/:imageId
 * 
 * Araç görselini sil.
 * 
 * Params:
 * - vehicleId: Vehicle ID
 * - imageId: Image ID
 * 
 * İş Akışı:
 * 1. Araç sahiplik kontrolü
 * 2. Görsel varlık kontrolü
 * 3. Dosya sisteminden sil
 * 4. Veritabanından sil
 * 
 * Response:
 * - success: true
 */
router.delete('/:vehicleId/images/:imageId', deleteVehicleImage);

// ===== VEHICLE SETTINGS ROUTES (ARAÇ AYARLARI) =====

/**
 * PATCH /vehicle-garage/:id/set-default
 * 
 * Aracı varsayılan olarak ayarla.
 * 
 * Params:
 * - id: Vehicle ID
 * 
 * İş Akışı:
 * 1. Araç sahiplik kontrolü
 * 2. Tüm araçların isDefault'unu false yap
 * 3. Bu aracı true yap
 * 
 * Varsayılan Araç:
 * - Rapor oluştururken otomatik seçilir
 * - Listelerde önce gösterilir
 * - Kullanıcı başına 1 tane
 * 
 * Response:
 * - success: true
 */
router.patch('/:id/set-default', setDefaultVehicle);

// ===== VEHICLE REPORTS ROUTES (ARAÇ RAPORLARI) =====

/**
 * GET /vehicle-garage/:id/reports
 * 
 * Belirli bir araca ait tüm raporları listele.
 * 
 * Params:
 * - id: Vehicle ID
 * 
 * Güvenlik:
 * - Araç sahiplik kontrolü
 * 
 * Response:
 * - reports: Rapor listesi (tarih sıralı)
 * - İçerik: Rapor görselleri dahil
 */
router.get('/:id/reports', getVehicleReports);

export default router;
