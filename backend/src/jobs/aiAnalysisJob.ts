/**
 * AI Analysis Job
 * 
 * AI analiz işlemlerini background job olarak işler.
 */

import { createWorker, addJob, getQueue } from '../services/queueService';
import { AIService } from '../services/aiService';
import { getPrismaClient } from '../utils/prisma';
import { logError, logInfo } from '../utils/logger';

const prisma = getPrismaClient();

export const AI_ANALYSIS_QUEUE = 'ai-analysis';

/**
 * AI Analiz Job'u ekle
 */
export interface AIAnalysisJobData {
  reportId: number;
  imagePath: string;
  vehicleInfo?: any;
  analysisType: 'damage' | 'paint' | 'engine-sound' | 'comprehensive';
}

export async function addAIAnalysisJob(data: AIAnalysisJobData): Promise<string> {
  return addJob(AI_ANALYSIS_QUEUE, 'analyze', data, {
    priority: 1,
    jobId: `ai-analysis-${data.reportId}`,
  });
}

/**
 * AI Analiz Worker'ı başlat
 */
export function startAIAnalysisWorker(): void {
  createWorker<AIAnalysisJobData>(AI_ANALYSIS_QUEUE, async (job) => {
    const { reportId, imagePath, vehicleInfo, analysisType } = job.data;

    logInfo('AI analiz job başlatıldı', { reportId, analysisType });

    try {
      // Raporu PROCESSING durumuna güncelle
      await prisma.vehicleReport.update({
        where: { id: reportId },
        data: { status: 'PROCESSING' },
      });

      // AI analizi yap
      let analysisResult: any;

      switch (analysisType) {
        case 'damage':
          analysisResult = await AIService.detectDamage(imagePath, vehicleInfo);
          break;
        case 'paint':
          // Paint analysis service'i kullan
          // analysisResult = await PaintAnalysisService.analyze(imagePath, vehicleInfo);
          throw new Error('Paint analysis not yet implemented in job');
        case 'engine-sound':
          // Engine sound analysis service'i kullan
          throw new Error('Engine sound analysis not yet implemented in job');
        case 'comprehensive':
          // Comprehensive analysis service'i kullan
          throw new Error('Comprehensive analysis not yet implemented in job');
        default:
          throw new Error(`Unknown analysis type: ${analysisType}`);
      }

      // Analiz sonucunu kaydet
      await prisma.vehicleReport.update({
        where: { id: reportId },
        data: {
          status: 'COMPLETED',
          aiAnalysisData: analysisResult,
        },
      });

      // AI Analysis Result kaydı oluştur
      await prisma.aiAnalysisResult.create({
        data: {
          reportId,
          analysisType,
          resultData: analysisResult,
          confidenceScore: analysisResult.confidence || analysisResult.güven || null,
          processingTimeMs: Date.now() - job.timestamp,
        },
      });

      logInfo('AI analiz job tamamlandı', { reportId, analysisType });

      return {
        success: true,
        reportId,
        analysisResult,
      };
    } catch (error) {
      // Hata durumunda raporu FAILED olarak işaretle
      await prisma.vehicleReport.update({
        where: { id: reportId },
        data: { status: 'FAILED' },
      });

      logError('AI analiz job hatası', error, { reportId, analysisType });
      throw error;
    }
  });

  logInfo('AI analiz worker başlatıldı', { queueName: AI_ANALYSIS_QUEUE });
}

