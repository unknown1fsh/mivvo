/**
 * Analiz Yanıt DTO'ları (Data Transfer Objects)
 * 
 * Bu dosya, AI analiz işlemlerinden dönen yanıtları temsil eden
 * veri transfer nesnelerini içerir. Clean Architecture'ın Response Layer'ında yer alır.
 * 
 * Farklı analiz türleri için (Boya, Hasar, Motor Sesi, Değer Tahmini, Tam Ekspertiz)
 * detaylı sonuç DTO'ları tanımlanmıştır.
 */

/**
 * Boya Analizi Yanıt DTO
 * 
 * AI tabanlı boya analizi sonucunu içerir.
 * Boya kalınlığı, çizikler, boyama durumu gibi detaylı bilgiler sağlar.
 * 
 * @property id - Analiz kayıt ID'si (primary key)
 * @property vehicleId - Analiz edilen aracın ID'si
 * @property angle - Fotoğrafın çekildiği açı (front, rear, left, right vb.)
 * @property paintCondition - Boya durumu (excellent: mükemmel, good: iyi, fair: orta, poor: kötü)
 * @property paintThickness - Boya kalınlığı (mikron cinsinden)
 * @property colorMatch - Renk uyumu yüzdesi (0-100 arası)
 * @property scratches - Tespit edilen çizik sayısı
 * @property dents - Tespit edilen göçük sayısı
 * @property rust - Pas var mı? (boolean)
 * @property oxidation - Oksidasyon seviyesi (0-100 arası)
 * @property glossLevel - Parlaklık seviyesi (0-100 arası)
 * @property overallScore - Genel boya skoru (0-100 arası)
 * @property recommendations - AI tarafından önerilen iyileştirmeler (dizi)
 * @property confidence - AI güven skoru (0-100 arası)
 * @property technicalDetails - Teknik boya detayları objesi
 * @property technicalDetails.paintSystem - Boya sistemi tipi
 * @property technicalDetails.primerType - Astar tipi
 * @property technicalDetails.baseCoat - Ana kat bilgisi
 * @property technicalDetails.clearCoat - Vernik bilgisi
 * @property technicalDetails.totalThickness - Toplam boya kalınlığı
 * @property technicalDetails.colorCode - Renk kodu
 * @property createdAt - Analiz oluşturulma tarihi
 * @property updatedAt - Analiz güncellenme tarihi
 */
export interface PaintAnalysisResponseDTO {
  id: number;
  vehicleId: number;
  angle: string;
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
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hasar Analizi Yanıt DTO
 * 
 * AI tabanlı hasar tespiti sonucunu içerir.
 * Hasarlı alanlar, tamir maliyeti ve hasar şiddeti gibi detaylı bilgiler sağlar.
 * 
 * @property id - Analiz kayıt ID'si (primary key)
 * @property reportId - Bağlı olduğu rapor ID'si (VehicleReport foreign key)
 * @property damageAreas - Tespit edilen hasarlı alanların listesi (DamageAreaDTO dizisi)
 * @property totalDamages - Toplam hasar sayısı
 * @property criticalDamages - Kritik hasar sayısı (high severity)
 * @property overallScore - Genel araç durumu skoru (0-100 arası, yüksek = iyi)
 * @property damageSeverity - Genel hasar şiddeti (low: düşük, medium: orta, high: yüksek, critical: kritik)
 * @property estimatedRepairCost - Tahmini toplam tamir maliyeti (TL cinsinden)
 * @property confidence - AI güven skoru (0-100 arası)
 * @property aiProvider - Kullanılan AI sağlayıcısı (OpenAI, Google Gemini vb.) (opsiyonel)
 * @property model - Kullanılan AI model adı (gpt-4-vision, gemini-pro-vision vb.) (opsiyonel)
 * @property createdAt - Analiz oluşturulma tarihi
 */
export interface DamageAnalysisResponseDTO {
  id: number;
  reportId: number;
  damageAreas: DamageAreaDTO[];
  totalDamages: number;
  criticalDamages: number;
  overallScore: number;
  damageSeverity: 'low' | 'medium' | 'high' | 'critical';
  estimatedRepairCost: number;
  confidence: number;
  aiProvider?: string;
  model?: string;
  createdAt: Date;
}

/**
 * Hasar Alanı DTO
 * 
 * Tek bir hasarlı alanı temsil eder.
 * AI tarafından tespit edilen her hasar için bir DamageAreaDTO oluşturulur.
 * 
 * @property type - Hasar tipi (scratch: çizik, dent: göçük, rust: pas, paint_chip: boya soyulması, crack: çatlak, corrosion: korozyon)
 * @property severity - Hasar şiddeti (low: düşük, medium: orta, high: yüksek)
 * @property location - Hasarın fotoğraf üzerindeki konumu (piksel koordinatları)
 * @property location.x - X koordinatı (sol üstten başlayarak)
 * @property location.y - Y koordinatı (sol üstten başlayarak)
 * @property location.width - Hasarın genişliği (piksel)
 * @property location.height - Hasarın yüksekliği (piksel)
 * @property description - AI tarafından oluşturulan hasar açıklaması
 * @property estimatedCost - Bu hasarın tahmini tamir maliyeti (TL cinsinden)
 * @property confidence - Bu hasar için AI güven skoru (0-100 arası)
 */
export interface DamageAreaDTO {
  type: 'scratch' | 'dent' | 'rust' | 'paint_chip' | 'crack' | 'corrosion';
  severity: 'low' | 'medium' | 'high';
  location: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  description: string;
  estimatedCost: number;
  confidence: number;
}

/**
 * Motor Sesi Analizi Yanıt DTO
 * 
 * AI tabanlı motor sesi analizi sonucunu içerir.
 * Motor sağlığı, tespit edilen sorunlar ve öneriler gibi detaylı bilgiler sağlar.
 * 
 * @property id - Analiz kayıt ID'si (primary key)
 * @property reportId - Bağlı olduğu rapor ID'si (VehicleReport foreign key)
 * @property overallScore - Genel motor sağlığı skoru (0-100 arası, yüksek = sağlıklı)
 * @property engineHealth - Motor sağlık durumu açıklaması (Excellent, Good, Fair, Poor)
 * @property detectedIssues - Tespit edilen motor sorunlarının listesi (EngineIssueDTO dizisi)
 * @property recommendations - AI tarafından önerilen bakım/onarım işlemleri (dizi)
 * @property confidence - AI güven skoru (0-100 arası)
 * @property aiProvider - Kullanılan AI sağlayıcısı (OpenAI, Google Gemini vb.) (opsiyonel)
 * @property model - Kullanılan AI model adı (whisper, gemini-audio vb.) (opsiyonel)
 * @property createdAt - Analiz oluşturulma tarihi
 */
export interface EngineSoundResponseDTO {
  id: number;
  reportId: number;
  overallScore: number;
  engineHealth: string;
  detectedIssues: EngineIssueDTO[];
  recommendations: string[];
  confidence: number;
  aiProvider?: string;
  model?: string;
  createdAt: Date;
}

/**
 * Motor Sorunu DTO
 * 
 * Tek bir motor sorununu temsil eder.
 * AI tarafından ses analizi ile tespit edilen her sorun için bir EngineIssueDTO oluşturulur.
 * 
 * @property issue - Sorun adı/başlığı (örn: "Timing Chain Noise", "Misfiring")
 * @property severity - Sorun şiddeti (low: düşük, medium: orta, high: yüksek/acil)
 * @property confidence - Bu sorun için AI güven skoru (0-100 arası)
 * @property description - Sorunun detaylı açıklaması
 * @property recommendation - Bu sorun için önerilen çözüm/işlem
 */
export interface EngineIssueDTO {
  issue: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
  recommendation: string;
}

/**
 * Değer Tahmini Yanıt DTO
 * 
 * AI tabanlı araç değer tahmini sonucunu içerir.
 * Piyasa değeri, durum ayarlamaları ve fiyat aralığı gibi detaylı bilgiler sağlar.
 * 
 * @property id - Analiz kayıt ID'si (primary key)
 * @property reportId - Bağlı olduğu rapor ID'si (VehicleReport foreign key)
 * @property estimatedValue - Tahmini araç değeri (TL cinsinden) - tüm faktörler dahil
 * @property marketValue - Piyasa değeri (TL cinsinden) - standart durum için
 * @property conditionAdjustment - Araç durumuna göre değer ayarlaması (pozitif veya negatif TL)
 * @property mileageAdjustment - Kilometre değerine göre ayarlama (pozitif veya negatif TL)
 * @property damageAdjustment - Hasarlara göre değer düşüşü (negatif TL)
 * @property confidence - AI güven skoru (0-100 arası)
 * @property priceRange - Tahmini fiyat aralığı objesi
 * @property priceRange.min - Minimum beklenen fiyat (TL)
 * @property priceRange.max - Maximum beklenen fiyat (TL)
 * @property recommendations - Değer artırıcı öneriler (dizi)
 * @property createdAt - Analiz oluşturulma tarihi
 */
export interface ValueEstimationResponseDTO {
  id: number;
  reportId: number;
  estimatedValue: number;
  marketValue: number;
  conditionAdjustment: number;
  mileageAdjustment: number;
  damageAdjustment: number;
  confidence: number;
  priceRange: {
    min: number;
    max: number;
  };
  recommendations: string[];
  createdAt: Date;
}

/**
 * Tam Ekspertiz Yanıt DTO
 * 
 * Kapsamlı ekspertiz raporu sonucunu içerir.
 * Tüm analiz türlerini (boya, hasar, motor sesi, değer tahmini) birleştiren en üst seviye DTO'dur.
 * 
 * @property id - Analiz kayıt ID'si (primary key)
 * @property reportId - Bağlı olduğu rapor ID'si (VehicleReport foreign key)
 * @property vehicleInfo - Ekspertiz edilen araç bilgileri objesi
 * @property vehicleInfo.brand - Araç markası
 * @property vehicleInfo.model - Araç modeli
 * @property vehicleInfo.year - Araç model yılı
 * @property vehicleInfo.plate - Araç plakası (opsiyonel)
 * @property vehicleInfo.vin - Şasi numarası (opsiyonel)
 * @property vehicleInfo.mileage - Araç kilometresi
 * @property paintAnalysis - Boya analizi sonucu (opsiyonel, yapıldıysa doldurulur)
 * @property damageAnalysis - Hasar analizi sonucu (opsiyonel, yapıldıysa doldurulur)
 * @property engineSound - Motor sesi analizi sonucu (opsiyonel, yapıldıysa doldurulur)
 * @property valueEstimation - Değer tahmini sonucu (opsiyonel, yapıldıysa doldurulur)
 * @property overallScore - Genel araç skoru (0-100 arası, tüm analizlerin ortalaması)
 * @property overallCondition - Genel araç durumu açıklaması (Excellent, Good, Fair, Poor)
 * @property recommendations - Genel öneriler listesi (tüm analizlerden birleştirilmiş)
 * @property createdAt - Ekspertiz oluşturulma tarihi
 */
export interface ComprehensiveExpertiseResponseDTO {
  id: number;
  reportId: number;
  vehicleInfo: {
    brand: string;
    model: string;
    year: number;
    plate?: string;
    vin?: string;
    mileage: number;
  };
  paintAnalysis?: PaintAnalysisResponseDTO;
  damageAnalysis?: DamageAnalysisResponseDTO;
  engineSound?: EngineSoundResponseDTO;
  valueEstimation?: ValueEstimationResponseDTO;
  overallScore: number;
  overallCondition: string;
  recommendations: string[];
  createdAt: Date;
}

