import { ReportRefundStatus, ReportStatus, ReportType, VehicleReport } from '@prisma/client'
import { getPrismaClient } from '../utils/prisma'
import { reserveCredits, confirmCredits, refundCredits } from '../utils/creditManager'
import { AIService } from './aiService'
import { logError, logInfo } from '../utils/logger'

const prisma = getPrismaClient()

export interface AnalysisReportPayload {
  userId: number
  reportType: ReportType
  vehiclePlate?: string
  vehicleBrand?: string
  vehicleModel?: string
  vehicleYear?: number
  vehicleColor?: string
  mileage?: number
  imagePath?: string
  audioPath?: string
  notes?: string
}

export interface AnalysisReportResult {
  success: boolean
  reportId: number
  report?: VehicleReport
  message: string
  aiResult?: any
  refunded?: boolean
  refundStatus?: ReportRefundStatus
}

type AnalysisHandlerContext = {
  imagePath?: string
  audioPath?: string
  vehicleInfo: Record<string, any>
}

export class AnalysisReportService {
  static async createReport(payload: AnalysisReportPayload): Promise<AnalysisReportResult> {
    const startTime = Date.now()

    const servicePricing = await prisma.servicePricing.findFirst({
      where: {
        serviceType: payload.reportType,
        isActive: true,
      },
    })

    if (!servicePricing) {
      throw new Error('Geçersiz rapor türü için fiyatlandırma bulunamadı.')
    }

    const report = await prisma.vehicleReport.create({
      data: {
        userId: payload.userId,
        reportType: payload.reportType,
        vehiclePlate: payload.vehiclePlate,
        vehicleBrand: payload.vehicleBrand,
        vehicleModel: payload.vehicleModel,
        vehicleYear: payload.vehicleYear,
        vehicleColor: payload.vehicleColor,
        mileage: payload.mileage,
        totalCost: servicePricing.basePrice,
        status: 'PENDING',
      },
    })

    const reservation = await reserveCredits(
      payload.userId,
      Number(servicePricing.basePrice),
      `${servicePricing.serviceName} raporu`,
      `report_${report.id}`,
      {
        reportId: report.id,
        reportType: payload.reportType,
      }
    )

    if (!reservation.success) {
      await prisma.vehicleReport.delete({ where: { id: report.id } })
      return {
        success: false,
        reportId: report.id,
        message: reservation.message || 'Kredi rezerve edilemedi.',
      }
    }

    await prisma.vehicleReport.update({
      where: { id: report.id },
      data: {
        creditTransactionId: reservation.transactionId,
      },
    })

    try {
      const analysisHandler = this.getAnalysisHandler(payload.reportType)
      const vehicleInfo = {
        plate: payload.vehiclePlate,
        brand: payload.vehicleBrand,
        model: payload.vehicleModel,
        year: payload.vehicleYear,
        color: payload.vehicleColor,
        mileage: payload.mileage,
      }

      const aiResult = await analysisHandler({
        imagePath: payload.imagePath,
        audioPath: payload.audioPath,
        vehicleInfo,
      })

      this.validateAnalysisResult(aiResult)

      const processingTimeMs = Date.now() - startTime

      const updatedReport = await prisma.vehicleReport.update({
        where: { id: report.id },
        data: {
          status: 'COMPLETED',
          aiAnalysisData: aiResult,
          failedReason: null,
          refundStatus: 'NONE',
        },
      })

      await prisma.aiAnalysisResult.create({
        data: {
          reportId: report.id,
          analysisType: payload.reportType,
          resultData: aiResult,
          confidenceScore: this.extractConfidence(aiResult),
          processingTimeMs,
        },
      })

      try {
        await confirmCredits(reservation.transactionId)
      } catch (confirmError) {
        logError('Kredi düşme hatası', confirmError, { reportId: report.id })
      }

      logInfo('Analiz raporu başarıyla oluşturuldu', {
        reportId: report.id,
        reportType: payload.reportType,
        durationMs: processingTimeMs,
      })

      return {
        success: true,
        reportId: report.id,
        report: updatedReport,
        message: 'Analiz raporu oluşturuldu.',
        aiResult,
      }
    } catch (error) {
      logError('Analiz raporu sırasında hata', error, { reportId: report.id })

      const failedReason = error instanceof Error ? error.message : 'AI analizi başarısız.'

      const updateData: any = {
        status: 'FAILED',
        failedReason,
      }

      let refundStatus: ReportRefundStatus = 'FAILED'

      if (reservation.transactionId) {
        try {
          await refundCredits(reservation.transactionId, failedReason)
          refundStatus = 'REFUNDED'
        } catch (refundError) {
          logError('Kredi iadesi başarısız', refundError, { reportId: report.id })
          refundStatus = 'FAILED'
        }

        updateData.refundStatus = refundStatus
      }

      await prisma.vehicleReport.update({
        where: { id: report.id },
        data: updateData,
      })

      return {
        success: false,
        reportId: report.id,
        message: failedReason,
        refundStatus,
        refunded: refundStatus === 'REFUNDED',
      }
    }
  }

  private static getAnalysisHandler(reportType: ReportType) {
    const handlers: Record<ReportType, (ctx: AnalysisHandlerContext) => Promise<any>> = {
      DAMAGE_ANALYSIS: ({ imagePath, vehicleInfo }) => this.requireImage(imagePath, AIService.detectDamage, vehicleInfo),
      DAMAGE_ASSESSMENT: ({ imagePath, vehicleInfo }) => this.requireImage(imagePath, AIService.detectDamage, vehicleInfo),
      FULL_REPORT: ({ imagePath, vehicleInfo }) => this.requireImage(imagePath, AIService.detectDamage, vehicleInfo),
      COMPREHENSIVE_EXPERTISE: ({ imagePath, vehicleInfo }) => this.requireImage(imagePath, AIService.detectDamage, vehicleInfo),
      PAINT_ANALYSIS: ({ imagePath, vehicleInfo }) => this.requireImage(imagePath, AIService.analyzePaint, vehicleInfo),
      ENGINE_SOUND_ANALYSIS: ({ audioPath, vehicleInfo }) => this.requireAudio(audioPath, AIService.analyzeEngineSound, vehicleInfo),
      VALUE_ESTIMATION: () => {
        throw new Error('Değer tahmini için özel AI akışı henüz desteklenmiyor.')
      },
    }

    const handler = handlers[reportType]

    if (!handler) {
      throw new Error('Bu rapor türü için AI akışı tanımlanmadı.')
    }

    return handler
  }

  private static async requireImage(
    imagePath: string | undefined,
    fn: (path: string, vehicleInfo?: any) => Promise<any>,
    vehicleInfo: Record<string, any>
  ) {
    if (!imagePath) {
      throw new Error('Analiz için görüntü dosyası gereklidir.')
    }
    return fn(imagePath, vehicleInfo)
  }

  private static async requireAudio(
    audioPath: string | undefined,
    fn: (path: string, vehicleInfo?: any) => Promise<any>,
    vehicleInfo: Record<string, any>
  ) {
    if (!audioPath) {
      throw new Error('Analiz için ses dosyası gereklidir.')
    }
    return fn(audioPath, vehicleInfo)
  }

  private static validateAnalysisResult(result: any) {
    if (!result || typeof result !== 'object' || Object.keys(result).length === 0) {
      throw new Error('AI analizinden geçerli sonuç alınamadı.')
    }

    if (!result.araçÖzeti && !result.hasarAlanları && !result.overallScore) {
      throw new Error('AI analiz çıktısı gerekli alanları içermiyor.')
    }
  }

  private static extractConfidence(result: any): number | null {
    const confidence = result?.confidence || result?.güven
    if (typeof confidence === 'number') {
      return confidence
    }

    if (typeof confidence === 'string') {
      const parsed = Number(confidence)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }

    return null
  }
}

