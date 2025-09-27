import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Types
export interface DamageArea {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'scratch' | 'dent' | 'rust' | 'oxidation';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  description?: string;
  area?: 'front' | 'side' | 'rear' | 'mechanical';
  repairCost?: number;
  partsAffected?: string[];
  overallAssessment?: OverallAssessment;
}

export interface OverallAssessment {
  damageLevel: 'hafif' | 'orta' | 'ağır' | 'pert';
  totalRepairCost: number;
  insuranceStatus: 'kurtarılabilir' | 'pert' | 'tamir edilebilir';
  marketValueImpact: number;
  detailedAnalysis: string;
}

export interface GeminiAnalysisResult {
  damageAreas: DamageArea[];
  overallAssessment: OverallAssessment;
}

export class GeminiService {
  private static genAI: GoogleGenerativeAI | null = null;
  private static isInitialized = false;
  private static cache: { [key: string]: DamageArea[] } = {}; // Basit in-memory cache

  /**
   * Gemini API'yi başlat
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🤖 Google Gemini API başlatılıyor...');
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.log('⚠️ GEMINI_API_KEY bulunamadı, fallback modunda devam');
        this.isInitialized = true;
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      
      this.isInitialized = true;
      console.log('🎉 Google Gemini API başarıyla başlatıldı');
    } catch (error) {
      console.error('❌ Google Gemini API başlatılamadı:', error);
      this.isInitialized = true; // Fallback modunda devam et
    }
  }

  /**
   * Resmi base64'e çevir (Base64 data URL destekli)
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
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      return processedBuffer.toString('base64');
    } catch (error) {
      console.error('❌ Resim işleme hatası:', error);
      throw error;
    }
  }

  /**
   * Resim hash'ini hesapla (cache için)
   */
  private static async getImageHash(imagePath: string): Promise<string> {
    try {
      const crypto = require('crypto');
      const imageBuffer = await fs.promises.readFile(imagePath);
      return crypto.createHash('md5').update(imageBuffer).digest('hex');
    } catch (error) {
      return Date.now().toString(); // Fallback
    }
  }

  /**
   * Gemini ile hasar tespiti
   */
  static async detectDamage(imagePath: string): Promise<DamageArea[]> {
    await this.initialize();

    if (!this.genAI) {
      throw new Error('❌ Google Gemini API başlatılamadı. Lütfen GEMINI_API_KEY environment variable\'ını kontrol edin.');
    }

    try {
      console.log('🔍 Google Gemini ile hasar tespiti yapılıyor:', imagePath);
      
      // Cache kontrolü (basit in-memory cache)
      const imageHash = await this.getImageHash(imagePath);
      const cacheKey = `damage_analysis_${imageHash}`;
      
      // Basit cache kontrolü (production'da Redis kullanılmalı)
      if (this.cache && this.cache[cacheKey]) {
        console.log('📋 Cache\'den hasar analizi alındı');
        return this.cache[cacheKey];
      }
      
      const imageBase64 = await this.convertImageToBase64(imagePath);
      
      // Gemini modelini al (temperature parametresi ile)
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.0-pro",
        generationConfig: {
          temperature: 0.7, // Rastgelelik için temperature ekle
          topP: 0.9,        // Çeşitlilik için topP ekle
          topK: 40          // Token seçimi için topK ekle
        }
      });
      
      // Benzersiz analiz için timestamp ekle
      const analysisId = Date.now();
      const randomSeed = Math.floor(Math.random() * 1000);
      
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
      
      // JSON'u parse et - önce JSON kısmını bul
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
      
      const analysisResult = JSON.parse(jsonText) as GeminiAnalysisResult;
      const damageAreas = analysisResult.damageAreas || [];
      
      console.log('✅ Gemini hasar tespiti tamamlandı:', damageAreas.length, 'hasar tespit edildi');
      console.log('📊 Genel değerlendirme:', analysisResult.overallAssessment);
      
      // overallAssessment verilerini damageAreas'a ekle
      if (analysisResult.overallAssessment) {
        damageAreas.forEach((damage: any) => {
          damage.overallAssessment = analysisResult.overallAssessment;
        });
      }
      
      // Cache'e kaydet (sadece başarılı analizler)
      if (damageAreas.length > 0) {
        this.cache[cacheKey] = damageAreas;
        console.log('💾 Hasar analizi cache\'e kaydedildi');
      }
      
      return damageAreas;
      
    } catch (error: any) {
      console.error('❌ Gemini hasar tespiti hatası:', error);
      
      // Detaylı hata mesajı
      if (error.message?.includes('quota')) {
        throw new Error('❌ Google Gemini API quota aşıldı. Lütfen daha sonra tekrar deneyin. (Quota: ' + error.message + ')');
      } else if (error.message?.includes('API key')) {
        throw new Error('❌ Google Gemini API key geçersiz. Lütfen GEMINI_API_KEY\'i kontrol edin.');
      } else if (error.message?.includes('overloaded')) {
        throw new Error('❌ Google Gemini API aşırı yüklü. Lütfen birkaç dakika sonra tekrar deneyin.');
      } else if (error.message?.includes('JSON')) {
        throw new Error('❌ Gemini yanıt formatı hatalı. AI modeli beklenmeyen format döndürdü.');
      } else {
        throw new Error('❌ Google Gemini API hatası: ' + error.message);
      }
    }
  }

}
