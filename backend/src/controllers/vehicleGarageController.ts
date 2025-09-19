import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
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

// Get all vehicles in user's garage
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
      { isDefault: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  res.json({
    success: true,
    data: vehicles
  });
});

// Get single vehicle by ID
export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const vehicle = await prisma.vehicleGarage.findFirst({
    where: { 
      id: parseInt(id),
      userId 
    },
    include: {
      vehicleImages: {
        orderBy: { uploadDate: 'desc' }
      },
      reports: {
        orderBy: { createdAt: 'desc' },
        take: 5
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

// Add new vehicle to garage
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

  // Check if plate already exists for this user
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

  // If this is set as default, unset other defaults
  if (isDefault) {
    await prisma.vehicleGarage.updateMany({
      where: { userId },
      data: { isDefault: false }
    });
  }

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

// Update vehicle
export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const updateData = req.body;

  // Check if vehicle exists and belongs to user
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

  // If plate is being updated, check for duplicates
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

  // If this is set as default, unset other defaults
  if (updateData.isDefault) {
    await prisma.vehicleGarage.updateMany({
      where: { userId, id: { not: parseInt(id) } },
      data: { isDefault: false }
    });
  }

  // Clean up data
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

// Delete vehicle
export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  // Check if vehicle exists and belongs to user
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

  // Delete associated images from filesystem
  for (const image of vehicle.vehicleImages) {
    const imagePath = path.join(__dirname, '../../uploads/vehicle-garage', path.basename(image.imagePath));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  // Delete vehicle (cascade will handle related records)
  await prisma.vehicleGarage.delete({
    where: { id: parseInt(id) }
  });

  return res.json({
    success: true,
    message: 'Araç başarıyla silindi'
  });
});

// Upload vehicle images
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

  // Check if vehicle exists and belongs to user
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

// Delete vehicle image
export const deleteVehicleImage = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { vehicleId, imageId } = req.params;

  // Check if vehicle exists and belongs to user
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

  // Find and delete image
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

  // Delete file from filesystem
  const imagePath = path.join(__dirname, '../../uploads/vehicle-garage', path.basename(image.imagePath));
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  await prisma.vehicleGarageImage.delete({
    where: { id: parseInt(imageId) }
  });

  return res.json({
    success: true,
    message: 'Resim başarıyla silindi'
  });
});

// Set default vehicle
export const setDefaultVehicle = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  // Check if vehicle exists and belongs to user
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

  // Unset all other defaults
  await prisma.vehicleGarage.updateMany({
    where: { userId },
    data: { isDefault: false }
  });

  // Set this vehicle as default
  await prisma.vehicleGarage.update({
    where: { id: parseInt(id) },
    data: { isDefault: true }
  });

  return res.json({
    success: true,
    message: 'Varsayılan araç başarıyla ayarlandı'
  });
});

// Get vehicle reports
export const getVehicleReports = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  // Check if vehicle exists and belongs to user
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

  const reports = await prisma.vehicleReport.findMany({
    where: { 
      vehicleGarageId: parseInt(id),
      userId 
    },
    orderBy: { createdAt: 'desc' },
    include: {
      vehicleImages: true,
      vehicleAudios: true
    }
  });

  return res.json({
    success: true,
    data: reports
  });
});

export { upload };
