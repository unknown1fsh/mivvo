/**
 * Genel API Yanıt DTO'ları (Data Transfer Objects)
 * 
 * Bu dosya, tüm API endpoint'lerinde kullanılan standart yanıt formatlarını içerir.
 * Clean Architecture'ın Response Layer'ında yer alır.
 * 
 * Tutarlı bir API response yapısı sağlar ve client'ın yanıtları kolayca parse edebilmesini sağlar.
 */

/**
 * Genel API Yanıtı DTO
 * 
 * Tüm API endpoint'lerinde kullanılan standart yanıt şablonudur.
 * Generic type kullanarak farklı veri tipleri döndürebilir.
 * 
 * @template T - Dönecek veri tipini belirtir (generic type)
 * @property success - İşlemin başarılı olup olmadığını belirtir (true/false)
 * @property data - İşlem başarılıysa dönen veri (generic type T) (opsiyonel)
 * @property message - Kullanıcıya gösterilecek başarı mesajı (opsiyonel)
 * @property error - Hata mesajı (başarısız durumlarda) (opsiyonel)
 * @property timestamp - Yanıtın oluşturulma zamanı (opsiyonel)
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: Date;
}

/**
 * Sayfalanmış Yanıt DTO
 * 
 * Liste döndüren endpoint'lerde sayfalama (pagination) desteği sağlar.
 * Büyük veri setlerini küçük parçalar halinde client'a gönderir.
 * 
 * @template T - Liste elemanlarının tipini belirtir (generic type)
 * @property success - İşlemin başarılı olup olmadığını belirtir
 * @property data - Sayfa içeriği (T tipinde dizi)
 * @property pagination - Sayfalama bilgileri objesi
 * @property pagination.page - Mevcut sayfa numarası (1'den başlar)
 * @property pagination.limit - Sayfa başına kayıt sayısı
 * @property pagination.total - Toplam kayıt sayısı (tüm sayfalar dahil)
 * @property pagination.pages - Toplam sayfa sayısı
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Hata Yanıtı DTO
 * 
 * Hata durumlarında client'a döndürülen standart hata formatıdır.
 * ErrorHandler middleware tarafından otomatik olarak oluşturulur.
 * 
 * @property success - Her zaman false (hata durumu)
 * @property error - Hata kodu veya kısa açıklama
 * @property message - Kullanıcıya gösterilecek detaylı hata mesajı
 * @property statusCode - HTTP status kodu (400, 404, 500 vb.)
 * @property timestamp - Hatanın oluşma zamanı
 * @property path - Hatanın oluştuğu API endpoint path'i (opsiyonel)
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: Date;
  path?: string;
}

