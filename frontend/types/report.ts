/**
 * Report Types (Rapor Tipleri)
 * 
 * Clean Architecture - Type Layer (Tip Katmanı)
 * 
 * Bu dosya, rapor ile ilgili tüm TypeScript tiplerini tanımlar.
 * 
 * İçerik:
 * - Report (Rapor)
 * - ReportType (Rapor Tipi)
 * - AIAnalysisResults (AI Analiz Sonuçları)
 * 
 * Kullanım:
 * ```typescript
 * import { Report, ReportType, AIAnalysisResults } from '@/types'
 * 
 * const report: Report = await reportService.getReport('123')
 * const types: ReportType[] = await reportService.getReportTypes()
 * ```
 */

import { VehicleInfo, EngineSoundAnalysisResult } from './vehicle'
import { PaintAnalysisResult } from './paintAnalysis'

// ===== REPORT INTERFACE =====

/**
 * Report (Rapor)
 * 
 * Genel rapor bilgileri.
 * 
 * Tüm rapor tipleri için ortak yapı:
 * - Hasar analizi raporu
 * - Boya analizi raporu
 * - Motor sesi analizi raporu
 * - Değer tahmini raporu
 * - Tam ekspertiz raporu
 */
export interface Report {
  /** Rapor ID */
  id: string
  
  /** Rapor tipi (örn: 'damage-analysis', 'paint-analysis') */
  type: string
  
  /** Araç bilgileri */
  vehicleInfo: VehicleInfo
  
  /** Oluşturulma tarihi */
  createdAt: Date
  
  /** Güncellenme tarihi */
  updatedAt: Date
  
  /** Rapor durumu */
  status: 'pending' | 'completed' | 'failed'
  
  /** Rapor verisi (tip'e göre değişir) */
  data?: any
}

// ===== REPORT TYPE INTERFACE =====

/**
 * Report Type (Rapor Tipi)
 * 
 * Mevcut rapor tiplerinin tanımları.
 * 
 * Kullanım:
 * - Pricing sayfası
 * - Rapor seçimi
 * - Ödeme işlemleri
 * 
 * Örnek:
 * ```typescript
 * const reportTypes: ReportType[] = [
 *   {
 *     id: 'damage-analysis',
 *     name: 'Hasar Analizi',
 *     price: 50,
 *     description: 'AI ile araç hasar tespiti',
 *     features: ['Hasar tespiti', 'Maliyet tahmini', ...],
 *     icon: 'damage-icon',
 *     popular: true
 *   }
 * ]
 * ```
 */
export interface ReportType {
  /** Rapor tipi ID */
  id: string
  
  /** Rapor adı (görünen metin) */
  name: string
  
  /** Fiyat (kredi) */
  price: number
  
  /** Açıklama */
  description: string
  
  /** Özellikler listesi */
  features: string[]
  
  /** İkon (icon name veya URL) */
  icon: string
  
  /** Popüler mi? (badge gösterimi için) */
  popular?: boolean
}

// ===== AI ANALYSIS RESULTS INTERFACE =====

/**
 * AI Analysis Results (AI Analiz Sonuçları)
 * 
 * AI analizlerinin birleştirilmiş sonuçları.
 * 
 * Kullanım:
 * - Rapor detay sayfası
 * - AI analiz dashboard
 * - Çoklu analiz sonuçları gösterimi
 */
export interface AIAnalysisResults {
  /** Rapor ID */
  reportId: string
  
  /** Araç bilgileri */
  vehicleInfo: VehicleInfo
  
  /** Rapor tipi */
  reportType: string
  
  /** Analiz tarihi */
  analysisDate: string
  
  /** Boya analizi sonucu (varsa) */
  paintAnalysis?: PaintAnalysisResult
  
  /** Motor sesi analizi sonucu (varsa) */
  engineSoundAnalysis?: EngineSoundAnalysisResult
  
  /** Yüklenen görsel sayısı */
  uploadedImages: number
  
  /** Yüklenen ses sayısı */
  uploadedAudios: number
  
  /** Genel güven skoru (0-100) */
  confidence: number
}
