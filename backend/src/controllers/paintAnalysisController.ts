import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Prisma Client'ı singleton olarak kullan
let prisma: PrismaClient;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Prisma Client initialization error:', error);
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/paint-analysis');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `paint-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir!'));
    }
  }
});

export interface PaintAnalysisResult {
  paintCondition: 'excellent' | 'good' | 'fair' | 'poor';
  paintThickness: number;
  colorMatch: number;
  scratches: number;
  dents: number;
  rust: boolean;
  oxidation: number;
  glossLevel: number;
  overallScore: number;
  recommendations: string[];
  confidence: number;
  technicalDetails: {
    paintSystem: string;
    primerType: string;
    baseCoat: string;
    clearCoat: string;
    totalThickness: number;
    colorCode: string;
  };
}

export class PaintAnalysisController {
  /**
   * Boya analizi için resim yükleme ve analiz
   */
  static async analyzePaint(req: Request, res: Response): Promise<void> {
    try {
      console.log('Paint analysis request received:', { body: req.body, files: req.files });
      
      const { vehicleId, angle, analysisType = 'paint' } = req.body;
      
      if (!vehicleId) {
        res.status(400).json({
          success: false,
          message: 'Araç ID gereklidir'
        });
        return;
      }

      if (!angle) {
        res.status(400).json({
          success: false,
          message: 'Görünüm açısı gereklidir'
        });
        return;
      }

      // Database bağlantısını test et
      try {
        await prisma.$connect();
        console.log('Database connected successfully');
      } catch (dbError) {
        console.error('Database connection error:', dbError);
        res.status(500).json({
          success: false,
          message: 'Veritabanı bağlantı hatası'
        });
        return;
      }

      // Resim dosyalarını işle
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'En az bir resim dosyası gereklidir'
        });
        return;
      }

      const analysisResults: PaintAnalysisResult[] = [];

      for (const file of files) {
        try {
          // Resmi optimize et ve analiz et
          const analysisResult = await this.processImage(file.path, angle);
          analysisResults.push(analysisResult);

          // Resmi veritabanına kaydet
          await prisma.paintAnalysis.create({
            data: {
              vehicleId: parseInt(vehicleId),
              angle: angle,
              imagePath: file.path,
              imageName: file.filename,
              analysisType: analysisType,
              paintCondition: analysisResult.paintCondition,
              paintThickness: analysisResult.paintThickness,
              colorMatch: analysisResult.colorMatch,
              scratches: analysisResult.scratches,
              dents: analysisResult.dents,
              rust: analysisResult.rust,
              oxidation: analysisResult.oxidation,
              glossLevel: analysisResult.glossLevel,
              overallScore: analysisResult.overallScore,
              recommendations: analysisResult.recommendations,
              confidence: analysisResult.confidence,
              technicalDetails: analysisResult.technicalDetails
            }
          });

          console.log(`Analysis completed for ${file.filename}`);
        } catch (error) {
          console.error(`Error processing ${file.filename}:`, error);
          // Tek resim hatası varsa devam et
        }
      }

      if (analysisResults.length === 0) {
        res.status(500).json({
          success: false,
          message: 'Resim analizi sırasında hata oluştu'
        });
        return;
      }

      // Genel analiz sonucunu hesapla
      const overallAnalysis = this.calculateOverallAnalysis(analysisResults);

      res.json({
        success: true,
        data: {
          analysisResults,
          overallAnalysis,
          processedImages: analysisResults.length,
          totalImages: files.length
        },
        message: 'Boya analizi başarıyla tamamlandı'
      });

    } catch (error) {
      console.error('Paint analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Boya analizi sırasında hata oluştu'
      });
    }
  }

  /**
   * Resim işleme ve AI analizi
   */
  private static async processImage(imagePath: string, angle: string): Promise<PaintAnalysisResult> {
    try {
      // Resmi optimize et
      const optimizedPath = await this.optimizeImage(imagePath);
      
      // AI analizi simülasyonu (gerçek AI modeli entegrasyonu burada olacak)
      const analysisResult = await this.simulateAIAnalysis(optimizedPath, angle);
      
      return analysisResult;
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }

  /**
   * Resim optimizasyonu
   */
  private static async optimizeImage(imagePath: string): Promise<string> {
    try {
      const optimizedPath = imagePath.replace(/\.[^/.]+$/, '_optimized.jpg');
      
      await sharp(imagePath)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toFile(optimizedPath);
      
      return optimizedPath;
    } catch (error) {
      console.error('Image optimization error:', error);
      return imagePath; // Optimizasyon hatası varsa orijinal dosyayı kullan
    }
  }

  /**
   * AI analizi simülasyonu (gerçek AI modeli burada entegre edilecek)
   */
  private static async simulateAIAnalysis(imagePath: string, angle: string): Promise<PaintAnalysisResult> {
    // Gerçek AI modeli entegrasyonu için bu fonksiyon güncellenecek
    // Şu anda simülasyon yapıyoruz
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekleme simülasyonu
    
    const conditions: Array<'excellent' | 'good' | 'fair' | 'poor'> = ['excellent', 'good', 'fair', 'poor'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      paintCondition: condition,
      paintThickness: Math.floor(Math.random() * 50) + 80, // 80-130 microns
      colorMatch: Math.floor(Math.random() * 20) + 80, // 80-100%
      scratches: Math.floor(Math.random() * 10),
      dents: Math.floor(Math.random() * 5),
      rust: Math.random() > 0.8,
      oxidation: Math.floor(Math.random() * 30),
      glossLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
      overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
      recommendations: [
        'Boya kalitesi genel olarak iyi durumda',
        'Küçük çizikler için retuş önerilir',
        'Düzenli yıkama ve cilalama yapın'
      ],
      confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
      technicalDetails: {
        paintSystem: '3-Kat Sistem (Primer + Baz + Clear)',
        primerType: 'Epoksi Primer',
        baseCoat: 'Metalik Baz Kat',
        clearCoat: 'UV Korumalı Clear Kat',
        totalThickness: Math.floor(Math.random() * 50) + 80,
        colorCode: '1G3 (Silver Metallic)'
      }
    };
  }

  /**
   * Genel analiz sonucunu hesapla
   */
  private static calculateOverallAnalysis(results: PaintAnalysisResult[]): any {
    if (results.length === 0) return null;

    const totalScore = results.reduce((sum, result) => sum + result.overallScore, 0);
    const averageScore = Math.round(totalScore / results.length);
    
    const totalThickness = results.reduce((sum, result) => sum + result.paintThickness, 0);
    const averageThickness = Math.round(totalThickness / results.length);
    
    const totalScratches = results.reduce((sum, result) => sum + result.scratches, 0);
    const totalDents = results.reduce((sum, result) => sum + result.dents, 0);
    const rustCount = results.filter(result => result.rust).length;
    
    return {
      overallScore: averageScore,
      averagePaintThickness: averageThickness,
      totalScratches,
      totalDents,
      rustDetected: rustCount > 0,
      analyzedAngles: results.length,
      recommendations: [
        'Genel boya kalitesi değerlendirildi',
        'Tüm açılar analiz edildi',
        'Detaylı rapor hazırlandı'
      ]
    };
  }

  /**
   * Boya analizi geçmişini getir
   */
  static async getAnalysisHistory(req: Request, res: Response): Promise<void> {
    try {
      const { vehicleId, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [analyses, total] = await Promise.all([
        prisma.paintAnalysis.findMany({
          where: vehicleId ? { vehicleId: parseInt(vehicleId as string) } : {},
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            angle: true,
            imageName: true,
            paintCondition: true,
            overallScore: true,
            createdAt: true,
            vehicle: {
              select: {
                make: true,
                model: true,
                year: true
              }
            }
          }
        }),
        prisma.paintAnalysis.count({
          where: vehicleId ? { vehicleId: parseInt(vehicleId as string) } : {}
        })
      ]);

      res.json({
        success: true,
        data: {
          analyses,
          total,
          page: Number(page),
          limit: Number(limit)
        },
        message: 'Boya analizi geçmişi başarıyla alındı'
      });

    } catch (error) {
      console.error('Analysis history error:', error);
      res.status(500).json({
        success: false,
        message: 'Analiz geçmişi alınırken hata oluştu'
      });
    }
  }

  /**
   * Detaylı analiz raporu getir
   */
  static async getAnalysisReport(req: Request, res: Response): Promise<void> {
    try {
      const { analysisId } = req.params;

      const analysis = await prisma.paintAnalysis.findUnique({
        where: { id: parseInt(analysisId) },
        include: {
          vehicle: {
            select: {
              make: true,
              model: true,
              year: true,
              plate: true,
              vin: true
            }
          }
        }
      });

      if (!analysis) {
        res.status(404).json({
          success: false,
          message: 'Analiz bulunamadı'
        });
        return;
      }

      res.json({
        success: true,
        data: analysis,
        message: 'Detaylı analiz raporu başarıyla alındı'
      });

    } catch (error) {
      console.error('Analysis report error:', error);
      res.status(500).json({
        success: false,
        message: 'Analiz raporu alınırken hata oluştu'
      });
    }
  }
}

// Multer middleware'i export et
export { upload };
