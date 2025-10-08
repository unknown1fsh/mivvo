/**
 * Kredi Fiyatlandırma Sabitleri (Credit Pricing Constants)
 * 
 * Clean Architecture - Constants Layer (Sabitler Katmanı)
 * 
 * Bu dosya, servis maliyetleri ve kredi fiyatlandırma yapısını içerir.
 * 
 * İçerik:
 * - AI analiz servis maliyetleri (kredi cinsinden)
 * - Toplu alım indirimleri
 * - Kredi paketleri ve fiyatları
 * - Servis detayları (ad, açıklama, maliyet)
 * 
 * Kredi Sistemi Mantığı:
 * - Her AI analiz işlemi belirli kredi tüketir
 * - Kullanıcı işlem öncesi yeterli krediye sahip olmalı
 * - Kredi satın alma paketleriyle indirim kazanılır
 * - Toplu işlem yapanlara ekstra indirim
 * 
 * Avantajları:
 * - Fiyat değişikliklerinde tek yerden güncelleme
 * - Tutarlı fiyatlandırma
 * - İndirim kuralları merkezi yönetim
 * - İş mantığı ve fiyat ayrımı
 */

/**
 * Kredi Fiyatlandırma Yapısı
 * 
 * Her AI servisinin kredi maliyetini ve indirim kurallarını tanımlar.
 */
export const CREDIT_PRICING = {
  // ===== ANALİZ SERVİS MALİYETLERİ (KREDİ CİNSİNDEN) =====
  
  /**
   * Boya Analizi Maliyeti
   * 
   * Tek açı için boya kalınlığı, renk uyumu, çizik tespiti
   * 10 kredi
   */
  PAINT_ANALYSIS: 10.0,

  /**
   * Hasar Tespiti Maliyeti
   * 
   * AI ile fotoğraf üzerinden hasar analizi
   * Çizik, göçük, pas, korozyon tespiti
   * 15 kredi
   */
  DAMAGE_ANALYSIS: 15.0,

  /**
   * Motor Sesi Analizi Maliyeti
   * 
   * Ses kaydı ile motor durumu tespiti
   * En karmaşık AI işlemi (ses işleme)
   * 20 kredi
   */
  ENGINE_SOUND_ANALYSIS: 20.0,

  /**
   * Değer Tahmini Maliyeti
   * 
   * Piyasa araştırması ve AI tabanlı değerleme
   * Hasar ve boya analizleriyle birleştirilir
   * 25 kredi
   */
  VALUE_ESTIMATION: 25.0,

  /**
   * Kapsamlı Ekspertiz Maliyeti
   * 
   * Tüm analizleri içeren premium hizmet
   * (Boya + Hasar + Motor Sesi + Değer Tahmini)
   * Normal toplam: 70 kredi
   * Paket indirimi: 50 kredi (20 kredi tasarruf)
   */
  COMPREHENSIVE_EXPERTISE: 50.0,

  // ===== TOPLU ALIM İNDİRİMLERİ =====
  /**
   * İndirim Seviyeleri
   * 
   * Belirli sayıda işlem yapan kullanıcılara otomatik indirim.
   * Oranlar 0-1 arası ondalık sayı (0.05 = %5)
   */
  DISCOUNTS: {
    /**
     * 10+ işlem indirimi
     * %5 indirim (0.05)
     */
    BULK_10: 0.05, // %5 indirim

    /**
     * 50+ işlem indirimi
     * %10 indirim (0.10)
     */
    BULK_50: 0.1, // %10 indirim

    /**
     * 100+ işlem indirimi
     * %15 indirim (0.15)
     */
    BULK_100: 0.15, // %15 indirim
  },

  // ===== KREDİ SATINAL MA PAKETLERİ =====
  /**
   * Kredi Paketleri
   * 
   * Kullanıcılar bu paketlerden kredi satın alabilir.
   * Her paket belirli indirim oranıyla sunulur.
   */
  PACKAGES: {
    /**
     * Başlangıç Paketi
     * 
     * - 100 kredi
     * - Normal fiyat: 100 TL
     * - Paket fiyatı: 95 TL
     * - İndirim: %5
     * 
     * Yaklaşık kullanım:
     * - 10 Boya Analizi
     * - 6 Hasar Tespiti
     * - 5 Motor Sesi Analizi
     * - 2 Kapsamlı Ekspertiz
     */
    STARTER: {
      credits: 100,        // Kredi miktarı
      price: 95,           // TL cinsinden fiyat
      discount: 0.05,      // %5 indirim
    },

    /**
     * Profesyonel Paketi
     * 
     * - 500 kredi
     * - Normal fiyat: 500 TL
     * - Paket fiyatı: 450 TL
     * - İndirim: %10
     * 
     * Yaklaşık kullanım:
     * - 50 Boya Analizi
     * - 33 Hasar Tespiti
     * - 25 Motor Sesi Analizi
     * - 10 Kapsamlı Ekspertiz
     */
    PROFESSIONAL: {
      credits: 500,        // Kredi miktarı
      price: 450,          // TL cinsinden fiyat
      discount: 0.1,       // %10 indirim
    },

    /**
     * Kurumsal Paket
     * 
     * - 1000 kredi
     * - Normal fiyat: 1000 TL
     * - Paket fiyatı: 850 TL
     * - İndirim: %15
     * 
     * Yaklaşık kullanım:
     * - 100 Boya Analizi
     * - 66 Hasar Tespiti
     * - 50 Motor Sesi Analizi
     * - 20 Kapsamlı Ekspertiz
     * 
     * Oto galeriler ve ekspertiz büroları için ideal
     */
    ENTERPRISE: {
      credits: 1000,       // Kredi miktarı
      price: 850,          // TL cinsinden fiyat
      discount: 0.15,      // %15 indirim
    },
  },
};

/**
 * Servis Maliyetleri (Detaylı)
 * 
 * Her servis için detaylı bilgi içerir.
 * UI'da fiyat listesi gösterimi ve açıklama için kullanılır.
 */
export const SERVICE_COSTS = {
  /**
   * Boya Analizi Servisi
   */
  PAINT_ANALYSIS: {
    cost: CREDIT_PRICING.PAINT_ANALYSIS,           // 10 kredi
    name: 'Boya Analizi',                          // Türkçe servis adı
    description: 'Araç boyasının detaylı analizi', // Servis açıklaması
  },

  /**
   * Hasar Tespiti Servisi
   */
  DAMAGE_ANALYSIS: {
    cost: CREDIT_PRICING.DAMAGE_ANALYSIS,                      // 15 kredi
    name: 'Hasar Tespiti',                                      // Türkçe servis adı
    description: 'AI destekli hasar tespiti ve değerlendirme', // Servis açıklaması
  },

  /**
   * Motor Sesi Analizi Servisi
   */
  ENGINE_SOUND_ANALYSIS: {
    cost: CREDIT_PRICING.ENGINE_SOUND_ANALYSIS,    // 20 kredi
    name: 'Motor Sesi Analizi',                    // Türkçe servis adı
    description: 'Motor sesinin AI ile analizi',   // Servis açıklaması
  },

  /**
   * Değer Tahmini Servisi
   */
  VALUE_ESTIMATION: {
    cost: CREDIT_PRICING.VALUE_ESTIMATION,                    // 25 kredi
    name: 'Değer Tahmini',                                     // Türkçe servis adı
    description: 'Araç değer tahmini ve piyasa analizi',      // Servis açıklaması
  },

  /**
   * Kapsamlı Ekspertiz Servisi
   */
  COMPREHENSIVE_EXPERTISE: {
    cost: CREDIT_PRICING.COMPREHENSIVE_EXPERTISE,           // 50 kredi
    name: 'Kapsamlı Ekspertiz',                             // Türkçe servis adı
    description: 'Tüm testleri içeren tam ekspertiz raporu', // Servis açıklaması
  },
};
