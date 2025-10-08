/**
 * Analiz İstek DTO'ları (Data Transfer Objects)
 * 
 * Bu dosya, AI analiz işlemleri için client'tan gelen istekleri temsil eden
 * veri transfer nesnelerini içerir. Clean Architecture'ın Request Layer'ında yer alır.
 * 
 * Farklı analiz türleri için (Boya, Hasar, Motor Sesi, Değer Tahmini, Tam Ekspertiz)
 * özel DTO'lar tanımlanmıştır.
 */

/**
 * Boya Analizi İsteği DTO
 * 
 * Araç boyasının AI ile analiz edilmesi için gerekli bilgileri taşır.
 * Fotoğraf açısı ve araç bilgisi ile birlikte kullanılır.
 * 
 * @property vehicleId - Garajdaki araç ID'si (opsiyonel, kayıtlı araçlar için)
 * @property angle - Fotoğrafın çekildiği açı (örn: front, rear, left, right) (zorunlu)
 * @property vehicleInfo - Araç bilgileri (vehicleId yoksa zorunlu)
 * @property vehicleInfo.brand - Araç markası (opsiyonel)
 * @property vehicleInfo.model - Araç modeli (opsiyonel)
 * @property vehicleInfo.year - Araç model yılı (opsiyonel)
 */
export interface PaintAnalysisRequestDTO {
  vehicleId?: number;
  angle: string;
  vehicleInfo?: {
    brand?: string;
    model?: string;
    year?: number;
  };
}

/**
 * Hasar Analizi İsteği DTO
 * 
 * Araç hasarlarının AI ile tespit edilmesi için gerekli bilgileri taşır.
 * Birden fazla açıdan fotoğraf yüklenebilir.
 * 
 * @property vehicleId - Garajdaki araç ID'si (opsiyonel, kayıtlı araçlar için)
 * @property vehicleInfo - Araç bilgileri (vehicleId yoksa zorunlu)
 * @property vehicleInfo.brand - Araç markası (opsiyonel)
 * @property vehicleInfo.model - Araç modeli (opsiyonel)
 * @property vehicleInfo.year - Araç model yılı (opsiyonel)
 * @property analysisType - Analiz türü (opsiyonel, örn: comprehensive, quick)
 * @property imageCount - Yüklenen fotoğraf sayısı (opsiyonel)
 */
export interface DamageAnalysisRequestDTO {
  vehicleId?: number;
  vehicleInfo?: {
    brand?: string;
    model?: string;
    year?: number;
  };
  analysisType?: string;
  imageCount?: number;
}

/**
 * Motor Sesi Analizi İsteği DTO
 * 
 * Araç motor sesinin AI ile analiz edilmesi için gerekli bilgileri taşır.
 * Ses kaydı ile motor durumu ve potansiyel sorunlar tespit edilir.
 * 
 * @property vehicleId - Garajdaki araç ID'si (opsiyonel, kayıtlı araçlar için)
 * @property vehicleInfo - Araç bilgileri (vehicleId yoksa zorunlu)
 * @property vehicleInfo.brand - Araç markası (opsiyonel)
 * @property vehicleInfo.model - Araç modeli (opsiyonel)
 * @property vehicleInfo.year - Araç model yılı (opsiyonel)
 * @property vehicleInfo.engineType - Motor tipi (benzinli, dizel, hibrit, elektrikli) (opsiyonel)
 * @property audioType - Ses tipi (ENGINE_SOUND: Motor çalışma sesi, EXHAUST_SOUND: Egzoz sesi, MECHANICAL_SOUND: Mekanik ses) (zorunlu)
 */
export interface EngineSoundRequestDTO {
  vehicleId?: number;
  vehicleInfo?: {
    brand?: string;
    model?: string;
    year?: number;
    engineType?: string;
  };
  audioType: 'ENGINE_SOUND' | 'EXHAUST_SOUND' | 'MECHANICAL_SOUND';
}

/**
 * Değer Tahmini İsteği DTO
 * 
 * Araç değerinin piyasa koşullarına ve durumuna göre tahmini için kullanılır.
 * Hasar ve boya analizleri ile birleştirilerek daha doğru sonuç elde edilir.
 * 
 * @property vehicleGarageId - Garajdaki araç ID'si (opsiyonel, kayıtlı araçlar için)
 * @property vehicleInfo - Araç bilgileri (zorunlu)
 * @property vehicleInfo.brand - Araç markası (zorunlu)
 * @property vehicleInfo.model - Araç modeli (zorunlu)
 * @property vehicleInfo.year - Araç model yılı (zorunlu)
 * @property vehicleInfo.mileage - Araç kilometresi (zorunlu)
 * @property vehicleInfo.condition - Araç genel durumu (opsiyonel)
 * @property vehicleInfo.modifications - Araçta yapılan modifikasyonlar (opsiyonel)
 * @property damageAnalysis - Önceden yapılmış hasar analizi sonucu (opsiyonel)
 * @property paintAnalysis - Önceden yapılmış boya analizi sonucu (opsiyonel)
 */
export interface ValueEstimationRequestDTO {
  vehicleGarageId?: number;
  vehicleInfo: {
    brand: string;
    model: string;
    year: number;
    mileage: number;
    condition?: string;
    modifications?: string[];
  };
  damageAnalysis?: any;
  paintAnalysis?: any;
}

/**
 * Tam Ekspertiz İsteği DTO
 * 
 * Araç için kapsamlı bir ekspertiz raporu oluşturmak için kullanılır.
 * Tüm analiz türlerini (boya, hasar, motor sesi, değer tahmini) içerebilir.
 * En üst seviye AI analiz hizmetidir.
 * 
 * @property vehicleGarageId - Garajdaki araç ID'si (opsiyonel, kayıtlı araçlar için)
 * @property vehicleInfo - Araç bilgileri (zorunlu)
 * @property vehicleInfo.brand - Araç markası (zorunlu)
 * @property vehicleInfo.model - Araç modeli (zorunlu)
 * @property vehicleInfo.year - Araç model yılı (zorunlu)
 * @property vehicleInfo.plate - Araç plakası (opsiyonel)
 * @property vehicleInfo.vin - Şasi numarası (opsiyonel)
 * @property vehicleInfo.mileage - Araç kilometresi (zorunlu)
 * @property vehicleInfo.fuelType - Yakıt tipi (benzin, dizel, LPG, elektrik, hibrit) (opsiyonel)
 * @property vehicleInfo.transmission - Vites türü (manuel, otomatik, CVT, DSG) (opsiyonel)
 * @property includeTests - Hangi testlerin yapılacağını belirten ayarlar (zorunlu)
 * @property includeTests.paintAnalysis - Boya analizi yapılsın mı? (boolean)
 * @property includeTests.damageDetection - Hasar tespiti yapılsın mı? (boolean)
 * @property includeTests.engineSound - Motor sesi analizi yapılsın mı? (boolean)
 * @property includeTests.valueEstimation - Değer tahmini yapılsın mı? (boolean)
 */
export interface ComprehensiveExpertiseRequestDTO {
  vehicleGarageId?: number;
  vehicleInfo: {
    brand: string;
    model: string;
    year: number;
    plate?: string;
    vin?: string;
    mileage: number;
    fuelType?: string;
    transmission?: string;
  };
  includeTests: {
    paintAnalysis: boolean;
    damageDetection: boolean;
    engineSound: boolean;
    valueEstimation: boolean;
  };
}

