/**
 * Araç İstek DTO'ları (Data Transfer Objects)
 * 
 * Bu dosya, araç yönetimi işlemleri için client'tan gelen istekleri temsil eden
 * veri transfer nesnelerini içerir. Clean Architecture'ın Request Layer'ında yer alır.
 * 
 * Araç oluşturma, güncelleme ve arama işlemleri için kullanılır.
 */

/**
 * Araç Oluşturma İsteği DTO
 * 
 * Yeni araç kaydı oluşturmak için gerekli bilgileri taşır.
 * VehicleGarage tablosuna yeni kayıt eklemek için kullanılır.
 * 
 * @property make - Araç markası (örn: Toyota, BMW) (zorunlu)
 * @property model - Araç modeli (örn: Corolla, 3 Series) (zorunlu)
 * @property year - Araç model yılı (zorunlu)
 * @property plate - Araç plakası (opsiyonel, unique olmalı)
 * @property vin - Şasi numarası (Vehicle Identification Number) (opsiyonel, unique olmalı)
 * @property color - Araç rengi (opsiyonel)
 * @property mileage - Araç kilometresi (opsiyonel)
 */
export interface CreateVehicleRequestDTO {
  make: string;
  model: string;
  year: number;
  plate?: string;
  vin?: string;
  color?: string;
  mileage?: number;
}

/**
 * Araç Güncelleme İsteği DTO
 * 
 * Mevcut araç kaydını güncellemek için kullanılır.
 * Tüm alanlar opsiyoneldir, sadece değişen alanlar gönderilir (partial update).
 * 
 * @property make - Güncellenecek araç markası (opsiyonel)
 * @property model - Güncellenecek araç modeli (opsiyonel)
 * @property year - Güncellenecek araç model yılı (opsiyonel)
 * @property plate - Güncellenecek araç plakası (opsiyonel)
 * @property vin - Güncellenecek şasi numarası (opsiyonel)
 * @property color - Güncellenecek araç rengi (opsiyonel)
 * @property mileage - Güncellenecek araç kilometresi (opsiyonel)
 */
export interface UpdateVehicleRequestDTO {
  make?: string;
  model?: string;
  year?: number;
  plate?: string;
  vin?: string;
  color?: string;
  mileage?: number;
}

/**
 * Araç Arama İsteği DTO
 * 
 * Araç veritabanında filtreleme yapmak için kullanılır.
 * Tüm alanlar opsiyoneldir ve birden fazla kriter birleştirilebilir.
 * 
 * @property make - Marka filtreleme (opsiyonel)
 * @property model - Model filtreleme (opsiyonel)
 * @property year - Yıl filtreleme (opsiyonel)
 * @property plate - Plaka filtreleme (opsiyonel, exact match)
 * @property vin - VIN filtreleme (opsiyonel, exact match)
 */
export interface VehicleSearchRequestDTO {
  make?: string;
  model?: string;
  year?: number;
  plate?: string;
  vin?: string;
}

