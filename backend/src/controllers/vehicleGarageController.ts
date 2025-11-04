/**
 * Vehicle Garage Controller (Araç Garajı Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, kullanıcının araç garajı yönetimini sağlar.
 * 
 * Sorumluluklar:
 * - Araç ekleme/düzenleme/silme (CRUD)
 * - Araç listesi görüntüleme
 * - Araç görseli yükleme/silme (Multer)
 * - Varsayılan araç ayarlama
 * - Araç raporları listeleme
 * 
 * Özellikler:
 * - Multer ile dosya yükleme
 * - Plaka benzersizliği kontrolü
 * - Sahiplik kontrolü (userId)
 * - Varsayılan araç mekanizması
 * - Dosya sistemi yönetimi
 * - Cascade silme
 * 
 * Multer Konfigürasyonu:
 * - Yükleme dizini: uploads/vehicle-garage/
 * - Maksimum dosya boyutu: 10MB
 * - İzin verilen dosya türleri: image/*
 * - Benzersiz dosya adı: timestamp-random
 * 
 * Endpoints:
 * - GET /api/vehicle-garage (Araç listesi)
 * - GET /api/vehicle-garage/:id (Araç detayı)
 * - POST /api/vehicle-garage (Araç ekle)
 * - PUT /api/vehicle-garage/:id (Araç güncelle)
 * - DELETE /api/vehicle-garage/:id (Araç sil)
 * - POST /api/vehicle-garage/:vehicleId/images (Görsel yükle)
 * - DELETE /api/vehicle-garage/:vehicleId/images/:imageId (Görsel sil)
 * - PUT /api/vehicle-garage/:id/default (Varsayılan araç)
 * - GET /api/vehicle-garage/:id/reports (Araç raporları)
 */

import { Request, Response } from 'express';
import { getPrismaClient } from '../utils/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = getPrismaClient();

// ===== MULTER KONFİGÜRASYONU =====

/**
 * Multer Storage Konfigürasyonu
 * 
 * Yüklenen görsellerin nereye ve nasıl kaydedileceğini belirler.
 * 
 * Özellikler:
 * - Otomatik dizin oluşturma (recursive)
 * - Benzersiz dosya adı (timestamp + random)
 * - Orijinal dosya uzantısını koruma
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Upload dizini
    const uploadDir = path.join(__dirname, '../../uploads/vehicle-garage');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

/**
 * Multer Upload Instance
 * 
 * Dosya yükleme middleware'i.
 * 
 * Limitler:
 * - Maksimum dosya boyutu: 10MB
 * - Sadece resim dosyaları (image/*)
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir'));
    }
  }
});

// ===== CONTROLLER METHODS =====

/**
 * Araç Garajını Listele
 * 
 * Kullanıcının tüm araçlarını listeler.
 * 
 * Özellikler:
 * - Varsayılan araç önce gelir (isDefault: desc)
 * - Görseller dahil
 * - Rapor sayısı dahil (_count)
 * 
 * @route   GET /api/vehicle-garage
 * @access  Private
 * 
 * @returns 200 - Araç listesi
 * 
 * @example
 * GET /api/vehicle-garage
 * Response: {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "plate": "34ABC123",
 *       "brand": "Toyota",
 *       "isDefault": true,
 *       "vehicleImages": [...],
 *       "_count": { "reports": 5 }
 *     }
 *   ]
 * }
 */
export const getVehicleGarage = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const vehicles = await prisma.vehicleGarage.findMany({
    where: { userId },
    include: {
      vehicleImages: {
        orderBy: { uploadDate: 'desc' }
      },
      _count: {
        select: { reports: true }
      }
    },
    orderBy: [
      { isDefault: 'desc' }, // Varsayılan araç önce
      { createdAt: 'desc' }
    ]
  });

  res.json({
    success: true,
    data: vehicles
  });
});

/**
 * Tek Bir Aracı Getir
 * 
 * Belirli bir aracın detaylı bilgilerini döndürür.
 * 
 * İçerik:
 * - Araç bilgileri
 * - Görseller
 * - Son 5 rapor
 * 
 * @route   GET /api/vehicle-garage/:id
 * @access  Private
 * 
 * @param req.params.id - Araç ID
 * 
 * @returns 200 - Araç detayları
 * @returns 404 - Araç bulunamadı
 * 
 * @example
 * GET /api/vehicle-garage/123
 */
export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const vehicle = await prisma.vehicleGarage.findFirst({
    where: { 
      id: parseInt(id),
      userId // Sahiplik kontrolü
    },
    include: {
      vehicleImages: {
        orderBy: { uploadDate: 'desc' }
      },
      reports: {
        orderBy: { createdAt: 'desc' },
        take: 5 // Son 5 rapor
      }
    }
  });

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: 'Araç bulunamadı'
    });
  }

  return res.json({
    success: true,
    data: vehicle
  });
});

/**
 * Garaja Araç Ekle
 * 
 * Kullanıcının garajına yeni araç ekler.
 * 
 * İşlem Akışı:
 * 1. Plaka benzersizliği kontrolü (kullanıcı bazında)
 * 2. Varsayılan araç ise diğerlerini kaldır
 * 3. Araç kaydı oluştur
 * 
 * Veri Dönüşümleri:
 * - Plaka ve VIN büyük harfe çevrilir
 * - Sayısal alanlar integer'a parse edilir
 * 
 * @route   POST /api/vehicle-garage
 * @access  Private
 * 
 * @param req.body.plate - Plaka (zorunlu, benzersiz)
 * @param req.body.brand - Marka
 * @param req.body.model - Model
 * @param req.body.year - Yıl
 * @param req.body.color - Renk
 * @param req.body.mileage - Km
 * @param req.body.vin - VIN numarası
 * @param req.body.fuelType - Yakıt türü
 * @param req.body.transmission - Vites türü
 * @param req.body.engineSize - Motor hacmi
 * @param req.body.bodyType - Kasa tipi
 * @param req.body.doors - Kapı sayısı
 * @param req.body.seats - Koltuk sayısı
 * @param req.body.notes - Notlar
 * @param req.body.isDefault - Varsayılan araç mı?
 * 
 * @returns 201 - Oluşturulan araç
 * @returns 400 - Plaka zaten kayıtlı
 * 
 * @example
 * POST /api/vehicle-garage
 * Body: {
 *   "plate": "34ABC123",
 *   "brand": "Toyota",
 *   "model": "Corolla",
 *   "year": 2020,
 *   "isDefault": true
 * }
 */
export const addVehicleToGarage = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const {
    plate,
    brand,
    model,
    year,
    color,
    mileage,
    vin,
    fuelType,
    transmission,
    engineSize,
    bodyType,
    doors,
    seats,
    notes,
    isDefault
  } = req.body;

  // Validation
  if (!plate) {
    return res.status(400).json({
      success: false,
      error: 'Plaka numarası zorunludur'
    });
  }

  // Plaka benzersizliği kontrolü (kullanıcı bazında)
  const existingVehicle = await prisma.vehicleGarage.findFirst({
    where: { 
      plate: plate.toUpperCase(),
      userId 
    }
  });

  if (existingVehicle) {
    return res.status(400).json({
      success: false,
      error: 'Bu plaka numarası zaten kayıtlı'
    });
  }

  // Varsayılan araç ise diğerlerini kaldır
  if (isDefault) {
    await prisma.vehicleGarage.updateMany({
      where: { userId },
      data: { isDefault: false }
    });
  }

  // Araç oluştur
  const vehicle = await prisma.vehicleGarage.create({
    data: {
      userId,
      plate: plate.toUpperCase(),
      brand,
      model,
      year: parseInt(year),
      color,
      mileage: mileage ? parseInt(mileage) : null,
      vin: vin?.toUpperCase(),
      fuelType,
      transmission,
      engineSize,
      bodyType,
      doors: doors ? parseInt(doors) : null,
      seats: seats ? parseInt(seats) : null,
      notes,
      isDefault: isDefault || false
    },
    include: {
      vehicleImages: true
    }
  });

  return res.status(201).json({
    success: true,
    data: vehicle,
    message: 'Araç başarıyla garaja eklendi'
  });
});

/**
 * Aracı Güncelle
 * 
 * Mevcut araç bilgilerini günceller.
 * 
 * İşlem Akışı:
 * 1. Araç varlık ve sahiplik kontrolü
 * 2. Plaka değişiyorsa benzersizlik kontrolü
 * 3. Varsayılan araç ise diğerlerini kaldır
 * 4. Veri temizleme (uppercase, parse)
 * 5. Güncelleme
 * 
 * @route   PUT /api/vehicle-garage/:id
 * @access  Private
 * 
 * @param req.params.id - Araç ID
 * @param req.body - Güncellenecek alanlar
 * 
 * @returns 200 - Güncellenmiş araç
 * @returns 404 - Araç bulunamadı
 * @returns 400 - Plaka zaten kayıtlı
 * 
 * @example
 * PUT /api/vehicle-garage/123
 * Body: {
 *   "mileage": 55000,
 *   "notes": "Yeni güncelleme"
 * }
 */
export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const updateData = req.body;

  // Araç varlık ve sahiplik kontrolü
  const existingVehicle = await prisma.vehicleGarage.findFirst({
    where: { 
      id: parseInt(id),
      userId 
    }
  });

  if (!existingVehicle) {
    return res.status(404).json({
      success: false,
      error: 'Araç bulunamadı'
    });
  }

  // Plaka değişiyorsa benzersizlik kontrolü
  if (updateData.plate && updateData.plate !== existingVehicle.plate) {
    const duplicateVehicle = await prisma.vehicleGarage.findFirst({
      where: { 
        plate: updateData.plate.toUpperCase(),
        userId,
        id: { not: parseInt(id) }
      }
    });

    if (duplicateVehicle) {
      return res.status(400).json({
        success: false,
        error: 'Bu plaka numarası zaten kayıtlı'
      });
    }
  }

  // Varsayılan araç ise diğerlerini kaldır
  if (updateData.isDefault) {
    await prisma.vehicleGarage.updateMany({
      where: { userId, id: { not: parseInt(id) } },
      data: { isDefault: false }
    });
  }

  // Veri temizleme ve dönüşümler
  if (updateData.plate) updateData.plate = updateData.plate.toUpperCase();
  if (updateData.vin) updateData.vin = updateData.vin.toUpperCase();
  if (updateData.year) updateData.year = parseInt(updateData.year);
  if (updateData.mileage) updateData.mileage = parseInt(updateData.mileage);
  if (updateData.doors) updateData.doors = parseInt(updateData.doors);
  if (updateData.seats) updateData.seats = parseInt(updateData.seats);

  const vehicle = await prisma.vehicleGarage.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      vehicleImages: {
        orderBy: { uploadDate: 'desc' }
      }
    }
  });

  return res.json({
    success: true,
    data: vehicle,
    message: 'Araç başarıyla güncellendi'
  });
});

/**
 * Aracı Sil
 * 
 * Aracı ve ilişkili tüm verileri siler.
 * 
 * İşlem Akışı:
 * 1. Araç varlık ve sahiplik kontrolü
 * 2. İlişkili görselleri dosya sisteminden sil
 * 3. Veritabanından sil (cascade ile reports vb.)
 * 
 * Cascade Silme:
 * - VehicleGarageImage kayıtları
 * - VehicleReport ilişkileri (nullable ise)
 * 
 * @route   DELETE /api/vehicle-garage/:id
 * @access  Private
 * 
 * @param req.params.id - Araç ID
 * 
 * @returns 200 - Araç silindi
 * @returns 404 - Araç bulunamadı
 * 
 * @example
 * DELETE /api/vehicle-garage/123
 */
export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  // Araç varlık ve sahiplik kontrolü
  const vehicle = await prisma.vehicleGarage.findFirst({
    where: { 
      id: parseInt(id),
      userId 
    },
    include: {
      vehicleImages: true,
      reports: true
    }
  });

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: 'Araç bulunamadı'
    });
  }

  // İlişkili görselleri dosya sisteminden sil
  for (const image of vehicle.vehicleImages) {
    const imagePath = path.join(__dirname, '../../uploads/vehicle-garage', path.basename(image.imagePath));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  // Aracı sil (cascade)
  await prisma.vehicleGarage.delete({
    where: { id: parseInt(id) }
  });

  return res.json({
    success: true,
    message: 'Araç başarıyla silindi'
  });
});

/**
 * Araç Görselleri Yükle
 * 
 * Multer ile birden fazla görsel yükler.
 * 
 * İşlem Akışı:
 * 1. Dosya varlık kontrolü
 * 2. Araç sahiplik kontrolü
 * 3. Her dosya için VehicleGarageImage kaydı oluştur
 * 
 * Multer Middleware:
 * - Route'da: upload.array('images', 10)
 * - Max 10 görsel
 * - 10MB max dosya boyutu
 * 
 * @route   POST /api/vehicle-garage/:vehicleId/images
 * @access  Private
 * 
 * @param req.params.vehicleId - Araç ID
 * @param req.files - Multer ile yüklenen dosyalar
 * 
 * @returns 200 - Yüklenen görseller
 * @returns 400 - Dosya bulunamadı
 * @returns 404 - Araç bulunamadı
 * 
 * @example
 * POST /api/vehicle-garage/123/images
 * FormData: { images: [file1, file2, file3] }
 */
export const uploadVehicleImages = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { vehicleId } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Resim dosyası bulunamadı'
    });
  }

  // Araç sahiplik kontrolü
  const vehicle = await prisma.vehicleGarage.findFirst({
    where: { 
      id: parseInt(vehicleId),
      userId 
    }
  });

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: 'Araç bulunamadı'
    });
  }

  // Her dosya için kayıt oluştur
  const uploadedImages = [];

  for (const file of files) {
    const vehicleImage = await prisma.vehicleGarageImage.create({
      data: {
        vehicleGarageId: parseInt(vehicleId),
        imagePath: file.path,
        imageName: file.originalname,
        imageType: 'EXTERIOR', // Default type
        fileSize: file.size
      }
    });

    uploadedImages.push(vehicleImage);
  }

  return res.json({
    success: true,
    data: uploadedImages,
    message: `${files.length} resim başarıyla yüklendi`
  });
});

/**
 * Araç Görselini Sil
 * 
 * Belirli bir görseli siler.
 * 
 * İşlem Akışı:
 * 1. Araç sahiplik kontrolü
 * 2. Görsel varlık kontrolü
 * 3. Dosya sisteminden sil
 * 4. Veritabanından sil
 * 
 * @route   DELETE /api/vehicle-garage/:vehicleId/images/:imageId
 * @access  Private
 * 
 * @param req.params.vehicleId - Araç ID
 * @param req.params.imageId - Görsel ID
 * 
 * @returns 200 - Görsel silindi
 * @returns 404 - Araç veya görsel bulunamadı
 * 
 * @example
 * DELETE /api/vehicle-garage/123/images/456
 */
export const deleteVehicleImage = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { vehicleId, imageId } = req.params;

  // Araç sahiplik kontrolü
  const vehicle = await prisma.vehicleGarage.findFirst({
    where: { 
      id: parseInt(vehicleId),
      userId 
    }
  });

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: 'Araç bulunamadı'
    });
  }

  // Görsel varlık kontrolü
  const image = await prisma.vehicleGarageImage.findFirst({
    where: {
      id: parseInt(imageId),
      vehicleGarageId: parseInt(vehicleId)
    }
  });

  if (!image) {
    return res.status(404).json({
      success: false,
      error: 'Resim bulunamadı'
    });
  }

  // Dosya sisteminden sil
  const imagePath = path.join(__dirname, '../../uploads/vehicle-garage', path.basename(image.imagePath));
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  // Veritabanından sil
  await prisma.vehicleGarageImage.delete({
    where: { id: parseInt(imageId) }
  });

  return res.json({
    success: true,
    message: 'Resim başarıyla silindi'
  });
});

/**
 * Varsayılan Aracı Ayarla
 * 
 * Belirli bir aracı varsayılan olarak işaretler.
 * 
 * İşlem Akışı:
 * 1. Araç sahiplik kontrolü
 * 2. Tüm araçların isDefault'unu false yap
 * 3. Bu aracı true yap
 * 
 * Varsayılan Araç:
 * - Rapor oluştururken otomatik seçilir
 * - Listelerde önce gösterilir
 * - Kullanıcı başına 1 tane olabilir
 * 
 * @route   PUT /api/vehicle-garage/:id/default
 * @access  Private
 * 
 * @param req.params.id - Araç ID
 * 
 * @returns 200 - Varsayılan araç ayarlandı
 * @returns 404 - Araç bulunamadı
 * 
 * @example
 * PUT /api/vehicle-garage/123/default
 */
export const setDefaultVehicle = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  // Araç sahiplik kontrolü
  const vehicle = await prisma.vehicleGarage.findFirst({
    where: { 
      id: parseInt(id),
      userId 
    }
  });

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: 'Araç bulunamadı'
    });
  }

  // Tüm araçların varsayılanını kaldır
  await prisma.vehicleGarage.updateMany({
    where: { userId },
    data: { isDefault: false }
  });

  // Bu aracı varsayılan yap
  await prisma.vehicleGarage.update({
    where: { id: parseInt(id) },
    data: { isDefault: true }
  });

  return res.json({
    success: true,
    message: 'Varsayılan araç başarıyla ayarlandı'
  });
});

/**
 * Araç Raporlarını Listele
 * 
 * Belirli bir araca ait tüm raporları listeler.
 * 
 * İçerik:
 * - Rapor bilgileri
 * - Rapor görselleri
 * - Tarih sıralı (en yeni önce)
 * 
 * @route   GET /api/vehicle-garage/:id/reports
 * @access  Private
 * 
 * @param req.params.id - Araç ID
 * 
 * @returns 200 - Rapor listesi
 * @returns 404 - Araç bulunamadı
 * 
 * @example
 * GET /api/vehicle-garage/123/reports
 */
export const getVehicleReports = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  // Araç sahiplik kontrolü
  const vehicle = await prisma.vehicleGarage.findFirst({
    where: { 
      id: parseInt(id),
      userId 
    }
  });

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: 'Araç bulunamadı'
    });
  }

  // Araç raporlarını getir
  const reports = await prisma.vehicleReport.findMany({
    where: { 
      vehicleGarageId: parseInt(id),
      userId 
    },
    orderBy: { createdAt: 'desc' },
    include: {
      vehicleImages: true
    }
  });

  return res.json({
    success: true,
    data: reports
  });
});

/**
 * Multer Upload Instance Export
 * 
 * Route'larda kullanılmak üzere export edilir.
 * 
 * Kullanım:
 * router.post('/:vehicleId/images', upload.array('images', 10), uploadVehicleImages)
 */
export { upload };
