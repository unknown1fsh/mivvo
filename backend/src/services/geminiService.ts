/**
 * Google Gemini AI Servisi (Gemini AI Service)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, Google Gemini AI API entegrasyonunu sağlar.
 * 
 * Amaç:
 * - Google Gemini AI ile görüntü analizi
 * - Araç hasar tespiti (damage detection)
 * - Vision AI ile detaylı analiz
 * - JSON formatında yapılandırılmış sonuç
 * - Cache mekanizması ile performans optimizasyonu
 * 
 * Google Gemini Özellikleri:
 * - Multimodal AI (görüntü + metin)
 * - Yüksek kaliteli görüntü analizi
 * - JSON output desteği
 * - Ücretsiz tier (limited quota)
 * 
 * API: Google Generative AI SDK (@google/generative-ai)
 * Model: gemini-1.0-pro (vision destekli)
 * 
 * Cache Stratejisi:
 * - Image hash ile unique key oluşturma
 * - In-memory cache (production'da Redis önerilir)
 * - Aynı fotoğraf için tekrar API çağrısı yapma
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Hasar Alanı Interface
 * 
 * Tespit edilen her hasar için detaylı bilgi içerir.
 */
export interface DamageArea {
  x: number;                                                    // X koordinatı (piksel)
  y: number;                                                    // Y koordinatı (piksel)
  width: number;                                                // Genişlik (piksel)
  height: number;                                               // Yükseklik (piksel)
  type: 'scratch' | 'dent' | 'rust' | 'oxidation';             // Hasar tipi
  severity: 'low' | 'medium' | 'high';                         // Şiddet seviyesi
  confidence: number;                                           // Güven seviyesi (0-100)
  description?: string;                                         // Hasar açıklaması (Türkçe)
  area?: 'front' | 'side' | 'rear' | 'mechanical';            // Bölge
  repairCost?: number;                                          // Onarım maliyeti (TL)
  partsAffected?: string[];                                     // Etkilenen parçalar
  overallAssessment?: OverallAssessment;                        // Genel değerlendirme
}

/**
 * Genel Değerlendirme Interface
 * 
 * Tüm hasarlar için özet bilgi içerir.
 */
export interface OverallAssessment {
  damageLevel: 'hafif' | 'orta' | 'ağır' | 'pert';             // Hasar seviyesi
  totalRepairCost: number;                                      // Toplam onarım maliyeti (TL)
  insuranceStatus: 'kurtarılabilir' | 'pert' | 'tamir edilebilir'; // Sigorta durumu
  marketValueImpact: number;                                    // Piyasa değerine etkisi (%)
  detailedAnalysis: string;                                     // Detaylı analiz metni
}

/**
 * Gemini Analiz Sonucu Interface
 * 
 * API'den dönen tam analiz sonucunu temsil eder.
 */
export interface GeminiAnalysisResult {
  damageAreas: DamageArea[];                                    // Tespit edilen hasarlar
  overallAssessment: OverallAssessment;                         // Genel değerlendirme
}

/**
 * GeminiService Sınıfı
 * 
 * Google Gemini AI API'yi kullanarak görüntü analizi yapar.
 * Static metodlarla çalışır, instance oluşturmaya gerek yoktur.
 */
export class GeminiService {
  /**
   * Google Generative AI client instance
   * 
   * null: Henüz initialize edilmedi
   * GoogleGenerativeAI: API kullanıma hazır
   */
  private static genAI: GoogleGenerativeAI | null = null;

  /**
   * Initialization durumu
   * 
   * Birden fazla initialize çağrısını önler.
   */
  private static isInitialized = false;

  /**
   * In-memory cache
   * 
   * Key: Image hash
   * Value: Analiz sonucu (DamageArea[])
   * 
   * Production'da Redis, Memcached vb. kullanılmalı.
   */
  private static cache: { [key: string]: DamageArea[] } = {};

  /**
   * Gemini API'yi başlatır
   * 
   * İşlem adımları:
   * 1. Duplicate initialization kontrolü
   * 2. GEMINI_API_KEY environment variable kontrolü
   * 3. GoogleGenerativeAI client oluşturma
   * 4. Başarı/hata loglama
   * 
   * Fallback: API key yoksa fallback modunda devam eder (hata fırlatmaz)
   * 
   * @returns Promise<void>
   * 
   * @example
   * await GeminiService.initialize();
   * // Artık detectDamage() kullanılabilir
   */
  static async initialize(): Promise<void> {
    // Zaten initialize edildiyse tekrar yapma
    if (this.isInitialized) return;

    try {
      console.log('🤖 Google Gemini API başlatılıyor...');
      
      // Environment variable'dan API key al
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.log('⚠️ GEMINI_API_KEY bulunamadı, fallback modunda devam');
        this.isInitialized = true;
        return;
      }

      // Google Generative AI client oluştur
      this.genAI = new GoogleGenerativeAI(apiKey);
      
      this.isInitialized = true;
      console.log('🎉 Google Gemini API başarıyla başlatıldı');
    } catch (error) {
      console.error('❌ Google Gemini API başlatılamadı:', error);
      this.isInitialized = true; // Fallback modunda devam et
    }
  }

  /**
   * Görüntüyü Base64 formatına çevirir
   * 
   * Gemini API base64 formatında görüntü bekler.
   * Sharp ile görüntü optimize edilir (boyut küçültme, kalite ayarı).
   * 
   * İki mod desteklenir:
   * 1. Base64 Data URL (data:image/jpeg;base64,...) → Base64 kısmını çıkar
   * 2. Dosya yolu (./uploads/photo.jpg) → Oku, işle, base64'e çevir
   * 
   * Optimizasyon:
   * - Maximum boyut: 1024x1024 (aspect ratio korunur)
   * - Format: JPEG
   * - Kalite: %85
   * 
   * @param imagePath - Görüntü dosya yolu veya base64 data URL
   * @returns Promise<string> - Base64 string (data URL olmadan)
   * @throws Error - Dosya okuma veya işleme hatası
   * 
   * @example
   * const base64 = await GeminiService.convertImageToBase64('./photo.jpg');
   * // 'iVBORw0KGgoAAAANSUhEUgAA...'
   * 
   * @private
   */
  private static async convertImageToBase64(imagePath: string): Promise<string> {
    try {
      // Eğer zaten Base64 data URL ise, sadece base64 kısmını al
      if (imagePath.startsWith('data:')) {
        const base64Data = imagePath.split(',')[1];
        return base64Data;
      }
      
      // Dosya yolu ise, dosyayı oku ve işle
      const imageBuffer = await fs.promises.readFile(imagePath);
      
      // Sharp ile resize et (Gemini için optimize)
      const processedBuffer = await sharp(imageBuffer)
        .resize(1024, 1024, { 
          fit: 'inside',              // Aspect ratio koru
          withoutEnlargement: true    // Küçük görüntüleri büyütme
        })
        .jpeg({ quality: 85 })        // JPEG formatı, %85 kalite
        .toBuffer();

      // Base64 string'e çevir
      return processedBuffer.toString('base64');
    } catch (error) {
      console.error('❌ Resim işleme hatası:', error);
      throw error;
    }
  }

  /**
   * Görüntü hash'ini hesaplar (cache key için)
   * 
   * MD5 hash kullanarak görüntü içeriğinden unique key oluşturur.
   * Aynı görüntü her zaman aynı hash'i üretir.
   * 
   * Fallback: Dosya okunamazsa timestamp döndürür.
   * 
   * @param imagePath - Görüntü dosya yolu
   * @returns Promise<string> - MD5 hash (32 karakter hex)
   * 
   * @example
   * const hash = await GeminiService.getImageHash('./photo.jpg');
   * // '5d41402abc4b2a76b9719d911017c592'
   * 
   * @private
   */
  private static async getImageHash(imagePath: string): Promise<string> {
    try {
      const crypto = require('crypto');
      const imageBuffer = await fs.promises.readFile(imagePath);
      return crypto.createHash('md5').update(imageBuffer).digest('hex');
    } catch (error) {
      return Date.now().toString(); // Fallback: Timestamp kullan
    }
  }

  /**
   * Gemini AI ile hasar tespiti yapar
   * 
   * İşlem akışı:
   * 1. Initialize kontrolü
   * 2. API key kontrolü
   * 3. Cache kontrolü (varsa cache'den döndür)
   * 4. Görüntüyü base64'e çevir
   * 5. Gemini model oluştur (generationConfig ile)
   * 6. Prompt + görüntü ile API çağrısı
   * 7. JSON yanıtı parse et
   * 8. Sonucu cache'e kaydet
   * 9. DamageArea[] döndür
   * 
   * Gemini Prompt:
   * - Detaylı Türkçe hasar analizi iste
   * - JSON formatında yapılandırılmış çıktı iste
   * - Her hasar için konum, tip, şiddet, maliyet vb. iste
   * - Genel değerlendirme iste
   * 
   * Generation Config:
   * - temperature: 0.7 (çeşitlilik için)
   * - topP: 0.9 (token seçimi için)
   * - topK: 40 (rastgelelik için)
   * 
   * Cache Stratejisi:
   * - Image hash ile unique key
   * - Başarılı analizler cache'lenir
   * - Sonraki isteklerde API çağrısı yapılmaz
   * 
   * @param imagePath - Görüntü dosya yolu veya base64 data URL
   * @returns Promise<DamageArea[]> - Tespit edilen hasarlar
   * @throws Error - API hatası, JSON parse hatası vb.
   * 
   * @example
   * const damages = await GeminiService.detectDamage('./photo.jpg');
   * console.log(damages.length); // 3
   * console.log(damages[0].description); // 'Ön tampon sol tarafında...'
   */
  static async detectDamage(imagePath: string): Promise<DamageArea[]> {
    // 1. Initialize kontrolü
    await this.initialize();

    // 2. API key kontrolü
    if (!this.genAI) {
      throw new Error('❌ Google Gemini API başlatılamadı. Lütfen GEMINI_API_KEY environment variable\'ını kontrol edin.');
    }

    try {
      console.log('🔍 Google Gemini ile hasar tespiti yapılıyor:', imagePath);
      
      // 3. Cache kontrolü
      const imageHash = await this.getImageHash(imagePath);
      const cacheKey = `damage_analysis_${imageHash}`;
      
      if (this.cache && this.cache[cacheKey]) {
        console.log('📋 Cache\'den hasar analizi alındı');
        return this.cache[cacheKey];
      }
      
      // 4. Görüntüyü base64'e çevir
      const imageBase64 = await this.convertImageToBase64(imagePath);
      
      // 5. Gemini modelini oluştur (temperature parametresi ile)
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.0-pro",
        generationConfig: {
          temperature: 0.7, // Rastgelelik için temperature ekle (0-1 arası)
          topP: 0.9,        // Çeşitlilik için topP ekle (0-1 arası)
          topK: 40          // Token seçimi için topK ekle (1-100 arası)
        }
      });
      
      // Benzersiz analiz için timestamp ve random seed ekle
      const analysisId = Date.now();
      const randomSeed = Math.floor(Math.random() * 1000);
      
      // 6. Detaylı Türkçe prompt oluştur
      const prompt = `Sen profesyonel bir araç eksperi ve hasar tespit uzmanısın. Bu araç fotoğrafını detaylı analiz et ve kapsamlı bir hasar raporu hazırla (Analiz ID: ${analysisId}, Rastgele Seed: ${randomSeed}).

🔍 DETAYLI ANALİZ YAP:

1. **HASAR TESPİTİ**: Fotoğrafta gördüğün her hasarı tespit et:
   - Çizikler, sıyrıklar, göçükler
   - Boya hasarları, renk solması, soyulma
   - Paslanma, korozyon, oksidasyon
   - Cam kırıkları, çatlakları
   - Tampon, kapı, kaput hasarları
   - Far, stop lambası hasarları
   - Jant, lastik hasarları
   - İç mekan hasarları (görülebiliyorsa)

2. **HASAR DEĞERLENDİRMESİ**: Her hasar için:
   - Konum (x, y koordinatları - gerçekçi değerler kullan)
   - Boyut (width, height - hasarın gerçek boyutuna uygun)
   - Tip (scratch, dent, rust, oxidation, crack, break, paint, bumper, door, window, headlight, taillight, mirror, wheel, body)
   - Şiddet (low, medium, high - hasarın gerçek ciddiyetine göre)
   - Güven seviyesi (70-100 arası)
   - Detaylı açıklama (Türkçe, anlaşılır)
   - Hasar bölgesi (front, side, rear, mechanical)
   - Onarım maliyeti (TL cinsinden, gerçekçi fiyatlar)
   - Etkilenen parçalar (gerçek parça isimleri)

3. **GENEL DEĞERLENDİRME**: 
   - Araç yaşına göre normal aşınma mı, ciddi hasar mı?
   - Güvenlik açısından risk var mı?
   - Estetik sorunlar neler?
   - Mekanik etkilenme var mı?

4. **ÇEŞİTLİLİK**: Her analiz farklı olmalı:
   - Farklı hasar kombinasyonları
   - Farklı şiddet seviyeleri
   - Farklı maliyet hesaplamaları
   - Farklı güvenlik değerlendirmeleri

SADECE JSON formatında yanıt ver:

{
  "damageAreas": [
    {
      "x": 120,
      "y": 180,
      "width": 45,
      "height": 25,
      "type": "scratch",
      "severity": "medium",
      "confidence": 92,
      "description": "Ön tampon sol tarafında orta şiddetli çizik, boya katmanında derin hasar tespit edildi",
      "area": "front",
      "repairCost": 2500,
      "partsAffected": ["bumper", "paint", "primer"]
    }
  ],
  "overallAssessment": {
    "damageLevel": "orta",
    "totalRepairCost": 8500,
    "insuranceStatus": "kurtarılabilir",
    "marketValueImpact": 15,
    "detailedAnalysis": "Araç genel olarak iyi durumda ancak ön bölgede orta şiddetli hasarlar mevcut. Tampon ve boya onarımı gerekli. Şasi ve mekanik parçalar sağlam. Estetik görünüm için profesyonel onarım önerilir.",
    "safetyConcerns": [
      "Ön tampondaki hasar çarpışma korumasını etkileyebilir",
      "Boya hasarı paslanmaya yol açabilir"
    ],
    "strengths": [
      "Şasi yapısı sağlam durumda",
      "Motor bölgesi hasarsız",
      "İç mekan korunmuş"
    ],
    "weaknesses": [
      "Ön bölgede orta şiddetli hasarlar",
      "Boya kalitesi etkilenmiş",
      "Estetik görünüm bozulmuş"
    ],
    "recommendations": [
      "Ön tampon onarımı acil yapılmalı",
      "Boya işlemi profesyonel serviste yapılmalı",
      "Sigorta şirketi ile görüşülmeli",
      "6 ay içinde onarım tamamlanmalı"
    ]
  }
}`;

      // 7. API çağrısı yap
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg"
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log('📝 Gemini yanıtı:', text.substring(0, 200) + '...');
      
      // 8. JSON'u parse et - önce JSON kısmını bul
      let jsonText = text;
      
      // Eğer yanıt JSON ile başlamıyorsa, JSON kısmını bul
      if (!text.trim().startsWith('{')) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        } else {
          throw new Error('Gemini yanıtında JSON bulunamadı');
        }
      }
      
      // JSON parse et
      const analysisResult = JSON.parse(jsonText) as GeminiAnalysisResult;
      const damageAreas = analysisResult.damageAreas || [];
      
      console.log('✅ Gemini hasar tespiti tamamlandı:', damageAreas.length, 'hasar tespit edildi');
      console.log('📊 Genel değerlendirme:', analysisResult.overallAssessment);
      
      // overallAssessment verilerini her DamageArea'ya ekle
      if (analysisResult.overallAssessment) {
        damageAreas.forEach((damage: any) => {
          damage.overallAssessment = analysisResult.overallAssessment;
        });
      }
      
      // 9. Cache'e kaydet (sadece başarılı analizler)
      if (damageAreas.length > 0) {
        this.cache[cacheKey] = damageAreas;
        console.log('💾 Hasar analizi cache\'e kaydedildi');
      }
      
      return damageAreas;
      
    } catch (error: any) {
      console.error('❌ Gemini hasar tespiti hatası:', error);
      
      // ===== DETAYLI HATA YÖNETİMİ =====
      
      // Quota (kota) hatası
      if (error.message?.includes('quota')) {
        throw new Error('❌ Google Gemini API quota aşıldı. Lütfen daha sonra tekrar deneyin. (Quota: ' + error.message + ')');
      } 
      
      // API key hatası
      else if (error.message?.includes('API key')) {
        throw new Error('❌ Google Gemini API key geçersiz. Lütfen GEMINI_API_KEY\'i kontrol edin.');
      } 
      
      // Overload (aşırı yüklenme) hatası
      else if (error.message?.includes('overloaded')) {
        throw new Error('❌ Google Gemini API aşırı yüklü. Lütfen birkaç dakika sonra tekrar deneyin.');
      } 
      
      // JSON parse hatası
      else if (error.message?.includes('JSON')) {
        throw new Error('❌ Gemini yanıt formatı hatalı. AI modeli beklenmeyen format döndürdü.');
      } 
      
      // Generic hata
      else {
        throw new Error('❌ Google Gemini API hatası: ' + error.message);
      }
    }
  }

}
