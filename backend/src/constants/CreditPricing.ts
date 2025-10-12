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
 * 
 * Fiyatlandırma Stratejisi (Ekim 2025):
 * - OpenAI maliyet analizi bazlı
 * - %200+ kar marjı hedefi
 * - 1 TL = 1 Kredi sistemi
 * - Agresif büyüme fiyatlandırması
 */
export const CREDIT_PRICING = {
  // ===== ANALİZ SERVİS MALİYETLERİ (KREDİ CİNSİNDEN) =====
  // NOT: 1 Kredi = 1 TL
  
  /**
   * Boya Analizi Maliyeti
   * 
   * - 1-5 resim analizi
   * - Boya kalınlığı, renk uyumu, çizik tespiti
   * - OpenAI maliyeti: ~1.26 TL
   * - Fiyat: 49 TL (Kâr marjı: %3,789)
   */
  PAINT_ANALYSIS: 49.0,

  /**
   * Hasar Tespiti Maliyeti
   * 
   * - 1-5 resim ile hasar analizi
   * - Çizik, göçük, pas, korozyon, kırık tespiti
   * - OpenAI maliyeti: ~1.26 TL
   * - Fiyat: 69 TL (Kâr marjı: %5,376)
   */
  DAMAGE_ANALYSIS: 69.0,

  /**
   * Motor Sesi Analizi Maliyeti
   * 
   * - Ses kaydı ile motor durumu tespiti
   * - AI ses işleme (Whisper API)
   * - OpenAI maliyeti: ~1.50 TL
   * - Fiyat: 79 TL (Kâr marjı: %5,167)
   */
  ENGINE_SOUND_ANALYSIS: 79.0,

  /**
   * Değer Tahmini Maliyeti
   * 
   * - Piyasa araştırması ve AI tabanlı değerleme
   * - Hasar ve boya analizleriyle birleştirilir
   * - Kapsamlı veri analizi
   * - Fiyat: 49 TL
   */
  VALUE_ESTIMATION: 49.0,

  /**
   * Kapsamlı Ekspertiz Maliyeti
   * 
   * Tüm analizleri içeren premium hizmet paket
   * - Boya Analizi (49 TL)
   * - Hasar Analizi (69 TL)
   * - Motor Sesi (79 TL)
   * - Değer Tahmini (49 TL)
   * 
   * Normal toplam: 246 TL
   * Paket fiyatı: 179 TL
   * Paket tasarrufu: 67 TL (%27 indirim)
   * 
   * OpenAI toplam maliyeti: ~3.60 TL
   * Kâr marjı: %4,872
   */
  COMPREHENSIVE_EXPERTISE: 179.0,

  // ===== TOPLU ALIM İNDİRİMLERİ =====
  /**
   * İndirim Seviyeleri
   * 
   * Belirli sayıda işlem yapan kullanıcılara otomatik indirim.
   * Oranlar 0-1 arası ondalık sayı (0.07 = %7)
   */
  DISCOUNTS: {
    /**
     * 3+ işlem indirimi
     * %7 bonus kredi
     */
    BULK_3: 0.07,

    /**
     * 10+ işlem indirimi
     * %15 bonus kredi
     */
    BULK_10: 0.15,

    /**
     * 20+ işlem indirimi
     * %20 bonus kredi
     */
    BULK_20: 0.2,
  },

  // ===== KREDİ SATINAL MA PAKETLERİ =====
  /**
   * Kredi Paketleri (1 Kredi = 1 TL)
   * 
   * Kullanıcılar bu paketlerden kredi satın alabilir.
   * Her paket belirli bonus kredi ile sunulur.
   */
  PACKAGES: {
    /**
     * Başlangıç Paketi
     * 
     * - 150 kredi alırsınız
     * - Ödeme: 149 TL
     * - Bonus: 1 TL (%0.7 bonus)
     * 
     * Yaklaşık kullanım:
     * - 3 Boya Analizi VEYA
     * - 2 Hasar Analizi VEYA
     * - 1 Motor Sesi Analizi VEYA
     * - İlk kez kullanıcılar için ideal
     */
    STARTER: {
      credits: 150,        // Alınan kredi
      price: 149,          // TL cinsinden fiyat
      discount: 0.007,     // %0.7 bonus
      realValue: 150,      // Gerçek değer
    },

    /**
     * Profesyonel Paketi (EN POPÜLER) ⭐
     * 
     * - 750 kredi alırsınız
     * - Ödeme: 649 TL
     * - Bonus: 101 TL (%15.6 bonus)
     * 
     * Yaklaşık kullanım:
     * - 15 Boya Analizi VEYA
     * - 10 Hasar Analizi VEYA
     * - 9 Motor Sesi Analizi VEYA
     * - 4 Kapsamlı Ekspertiz
     * 
     * Düzenli kullanıcılar için ideal
     */
    PROFESSIONAL: {
      credits: 750,        // Alınan kredi
      price: 649,          // TL cinsinden fiyat
      discount: 0.156,     // %15.6 bonus
      realValue: 750,      // Gerçek değer
    },

    /**
     * Kurumsal Paket
     * 
     * - 1500 kredi alırsınız
     * - Ödeme: 1199 TL
     * - Bonus: 301 TL (%25.1 bonus)
     * 
     * Yaklaşık kullanım:
     * - 30 Boya Analizi VEYA
     * - 21 Hasar Analizi VEYA
     * - 19 Motor Sesi Analizi VEYA
     * - 8 Kapsamlı Ekspertiz
     * 
     * Oto galeriler, ekspertiz büroları ve kurumsal müşteriler için ideal
     */
    ENTERPRISE: {
      credits: 1500,       // Alınan kredi
      price: 1199,         // TL cinsinden fiyat
      discount: 0.251,     // %25.1 bonus
      realValue: 1500,     // Gerçek değer
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
    cost: CREDIT_PRICING.PAINT_ANALYSIS,                          // 49 TL
    name: 'Boya Analizi',                                         // Türkçe servis adı
    description: 'AI destekli boya kalitesi ve renk analizi',    // Servis açıklaması
    features: ['1-5 resim analizi', 'Renk eşleştirme', 'Çizik tespiti', 'Kalite değerlendirmesi'],
  },

  /**
   * Hasar Tespiti Servisi
   */
  DAMAGE_ANALYSIS: {
    cost: CREDIT_PRICING.DAMAGE_ANALYSIS,                         // 69 TL
    name: 'Hasar Değerlendirmesi',                                // Türkçe servis adı
    description: 'AI destekli hasar tespiti ve değerlendirme',   // Servis açıklaması
    features: ['1-5 resim analizi', 'Çarpışma hasarları', 'Çizik ve göçük analizi', 'Onarım maliyet tahmini'],
  },

  /**
   * Motor Sesi Analizi Servisi
   */
  ENGINE_SOUND_ANALYSIS: {
    cost: CREDIT_PRICING.ENGINE_SOUND_ANALYSIS,                   // 79 TL
    name: 'Motor Sesi Analizi',                                   // Türkçe servis adı
    description: 'Ses kaydı ile motor durumu AI analizi',        // Servis açıklaması
    features: ['Çoklu ses dosyası', 'Motor sağlık durumu', 'Anormallik tespiti', 'Detaylı rapor'],
  },

  /**
   * Değer Tahmini Servisi
   */
  VALUE_ESTIMATION: {
    cost: CREDIT_PRICING.VALUE_ESTIMATION,                        // 49 TL
    name: 'Değer Tahmini',                                        // Türkçe servis adı
    description: 'AI tabanlı piyasa değeri hesaplama',           // Servis açıklaması
    features: ['Piyasa analizi', 'Değer hesaplama', 'Karşılaştırma', 'Detaylı rapor'],
  },

  /**
   * Kapsamlı Ekspertiz Servisi
   */
  COMPREHENSIVE_EXPERTISE: {
    cost: CREDIT_PRICING.COMPREHENSIVE_EXPERTISE,                 // 179 TL
    name: 'Kapsamlı Ekspertiz',                                   // Türkçe servis adı
    description: 'Tüm analizleri içeren premium paket',          // Servis açıklaması
    features: ['Tüm analizler dahil', 'Boya + Hasar + Motor + Değer', 'Detaylı kapsamlı rapor', '67 TL tasarruf'],
    savings: 67,                                                   // Normal fiyattan tasarruf
    normalPrice: 246,                                              // Normal toplam fiyat
  },
};
