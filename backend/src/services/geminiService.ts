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
   * Resmi base64'e çevir
   */
  private static async convertImageToBase64(imagePath: string): Promise<string> {
    try {
      // Resmi oku ve işle
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
   * Gemini ile hasar tespiti
   */
  static async detectDamage(imagePath: string): Promise<DamageArea[]> {
    await this.initialize();

    if (!this.genAI) {
      throw new Error('❌ Google Gemini API başlatılamadı. Lütfen GEMINI_API_KEY environment variable\'ını kontrol edin.');
    }

    try {
      console.log('🔍 Google Gemini ile hasar tespiti yapılıyor:', imagePath);
      
      const imageBase64 = await this.convertImageToBase64(imagePath);
      
      // Gemini modelini al
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Bu araç fotoğrafını detaylı analiz et ve hasarları tespit et. Fotoğrafta gördüğün her hasarı, çizik, ezik, pas, boya problemi, cam kırığı, tampon hasarı, kapı hasarı, far hasarı gibi tüm detayları belirt. Her hasar için:

1. Tam konumunu (x, y koordinatları)
2. Boyutunu (width, height)
3. Hasar tipini (scratch, dent, rust, oxidation)
4. Şiddetini (low, medium, high)
5. Güven seviyesini (0-100 arası)
6. Detaylı açıklamasını
7. Hasar bölgesini (front, side, rear, mechanical)
8. Onarım maliyetini (TL cinsinden)
9. Etkilenen parçaları (array olarak)

SADECE JSON formatında yanıt ver, başka hiçbir metin ekleme:

{
  "damageAreas": [
    {
      "x": 100,
      "y": 150,
      "width": 50,
      "height": 30,
      "type": "scratch",
      "severity": "low",
      "confidence": 95,
      "description": "Ön tamponda hafif çizik, boya katmanında küçük hasar",
      "area": "front",
      "repairCost": 1000,
      "partsAffected": ["bumper", "paint"]
    }
  ],
  "overallAssessment": {
    "damageLevel": "hafif",
    "totalRepairCost": 5000,
    "insuranceStatus": "kurtarılabilir",
    "marketValueImpact": 10,
    "detailedAnalysis": "Araçta tespit edilen hasarların detaylı analizi. Ön tamponda hafif çizikler mevcut. Genel durum iyi, sadece estetik onarım gerekli. Şasi ve mekanik parçalar sağlam durumda."
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
