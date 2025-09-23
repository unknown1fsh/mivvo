import { RealAIService } from './realAIService';
import { GeminiService } from './geminiService';

// AI Model Interfaces
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
  damageAreas?: {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'scratch' | 'dent' | 'rust' | 'oxidation';
    severity: 'low' | 'medium' | 'high';
    confidence: number;
    overallAssessment?: any;
  }[];
}

export interface EngineSoundAnalysisResult {
  overallScore: number;
  engineHealth: string;
  rpmAnalysis: {
    idleRpm: number;
    maxRpm: number;
    rpmStability: number;
  };
  frequencyAnalysis: {
    dominantFrequencies: number[];
    harmonicDistortion: number;
    noiseLevel: number;
  };
  detectedIssues: {
    issue: string;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
    description: string;
    recommendation: string;
  }[];
  performanceMetrics: {
    engineEfficiency: number;
    vibrationLevel: number;
    acousticQuality: number;
  };
  recommendations: string[];
}

export class AIService {
  private static isInitialized = false;

  /**
   * AI servisini başlat
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🤖 AI servisi başlatılıyor...');
      
      // Önce Gemini'yi dene (ücretsiz)
      await GeminiService.initialize();
      
      // Sonra OpenAI'yi dene (fallback)
      await RealAIService.initialize();

      this.isInitialized = true;
      console.log('🎉 AI servisi başlatıldı');
    } catch (error) {
      console.error('❌ AI servisi başlatılırken hata:', error);
      this.isInitialized = true; // Fallback modunda devam et
    }
  }

  /**
   * Boya analizi - OpenAI Vision API ile
   */
  static async analyzePaint(imagePath: string, angle: string): Promise<PaintAnalysisResult> {
    await this.initialize();

    try {
      console.log('🎨 OpenAI Vision API ile boya analizi yapılıyor...');
      return await RealAIService.analyzePaint(imagePath, angle);
    } catch (error) {
      console.error('❌ OpenAI boya analizi hatası:', error);
      throw error;
    }
  }

  /**
   * Hasar tespiti - Sadece Gemini API ile
   */
  static async detectDamage(imagePath: string): Promise<PaintAnalysisResult['damageAreas']> {
    await this.initialize();

    try {
      console.log('🔍 Google Gemini ile hasar tespiti yapılıyor...');
      return await GeminiService.detectDamage(imagePath);
    } catch (error) {
      console.error('❌ Gemini hasar tespiti hatası:', error);
      throw error; // Gemini'den gelen detaylı hata mesajını direkt geçir
    }
  }

  /**
   * Motor sesi analizi - OpenAI API ile
   */
  static async analyzeEngineSound(audioPath: string, vehicleInfo: any): Promise<EngineSoundAnalysisResult> {
    await this.initialize();

    try {
      console.log('🔊 OpenAI API ile motor sesi analizi yapılıyor...');
      return await RealAIService.analyzeEngineSound(audioPath, vehicleInfo);
    } catch (error) {
      console.error('❌ OpenAI motor sesi analizi hatası:', error);
      throw error;
    }
  }



}
