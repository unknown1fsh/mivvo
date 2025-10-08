/**
 * Basit Yedek Servis (Simple Fallback Service)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, gerçek AI API'leri kullanılamadığında devreye giren yedek (fallback) servistir.
 * 
 * Amaç:
 * - AI API'leri down olduğunda sistem çalışmaya devam etsin
 * - Development/test ortamında API key olmadan test yapılabilsin
 * - Simülasyon verileriyle demo yapılabilsin
 * - Cache ile tekrar eden istekleri hızlandırsın
 * 
 * Simülasyon Mantığı:
 * - Rastgele ama gerçekçi veri üretir
 * - Weighted random (ağırlıklı rastgele) ile gerçekçi dağılım
 * - Cache kullanarak aynı input için aynı output döndürür
 * 
 * NOT: Production'da gerçek AI servisler kullanılmalıdır!
 * Bu servis sadece fallback amaçlıdır.
 */

import { PaintAnalysisResult } from './aiService';

/**
 * SimpleFallbackService Sınıfı
 * 
 * AI servislerinin basit simülasyonunu sağlar.
 * Gerçek AI yerine rastgele ama tutarlı veriler üretir.
 */
export class SimpleFallbackService {
  /**
   * In-memory cache
   * 
   * Key: imagePath + analysisType
   * Value: Analiz sonucu
   * 
   * Cache sayesinde aynı fotoğraf için her zaman aynı sonuç döner.
   */
  private static cache = new Map<string, any>();

  /**
   * Boya Analizi Simülasyonu
   * 
   * Gerçek AI yerine rastgele ama gerçekçi boya analizi üretir.
   * Weighted random kullanarak çoğunlukla iyi/orta durumlar üretir.
   * 
   * @param imagePath - Fotoğraf path'i (cache key için kullanılır)
   * @param angle - Fotoğraf açısı (front, rear, left, right)
   * @returns Promise<PaintAnalysisResult> - Simüle boya analiz sonucu
   * 
   * @example
   * const result = await SimpleFallbackService.analyzePaint('./photo.jpg', 'front');
   * console.log(result.paintCondition); // 'good' (çoğunlukla)
   */
  static async analyzePaint(imagePath: string, angle: string): Promise<PaintAnalysisResult> {
    // Cache kontrolü - aynı fotoğraf için hep aynı sonuç
    const cacheKey = `paint_${imagePath}_${angle}`;
    
    if (this.cache.has(cacheKey)) {
      console.log('📋 Cache\'den boya analizi döndürülüyor');
      return this.cache.get(cacheKey);
    }

    console.log('🔄 Basit fallback boya analizi başlatılıyor...');
    
    // Gerçekçi analiz süresi simülasyonu (1 saniye)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Boya durumu seçimi (Weighted Random)
    // %10 excellent, %40 good, %40 fair, %10 poor
    const conditions: Array<'excellent' | 'good' | 'fair' | 'poor'> = ['excellent', 'good', 'fair', 'poor'];
    const weights = [0.1, 0.4, 0.4, 0.1]; // Çoğunlukla iyi ve orta durum
    const random = Math.random();
    let cumulative = 0;
    let condition: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    
    // Weighted random selection
    for (let i = 0; i < conditions.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        condition = conditions[i];
        break;
      }
    }

    // Boya analiz sonucu oluştur (rastgele ama gerçekçi değerler)
    const result: PaintAnalysisResult = {
      paintCondition: condition,                           // Boya durumu (excellent, good, fair, poor)
      paintThickness: Math.floor(Math.random() * 50) + 80, // 80-130 mikron arası
      colorMatch: Math.floor(Math.random() * 20) + 80,     // %80-100 renk uyumu
      scratches: Math.floor(Math.random() * 8),             // 0-7 çizik
      dents: Math.floor(Math.random() * 3),                 // 0-2 göçük
      rust: Math.random() > 0.85,                           // %15 pas olasılığı
      oxidation: Math.floor(Math.random() * 25),            // 0-25% oksidasyon
      glossLevel: Math.floor(Math.random() * 35) + 65,      // %65-100 parlaklık
      overallScore: Math.floor(Math.random() * 25) + 75,    // 75-100 puan
      recommendations: [
        'Düzenli yıkama ve cilalama yapın',
        'UV koruması kullanın',
        angle === 'front' ? 'Ön tampon bölgesine dikkat edin' : `${angle} bölgesi için özel bakım yapın`,
        'Küçük çizikler için retuş düşünün'
      ].slice(0, Math.floor(Math.random() * 3) + 2), // 2-4 öneri (rastgele)
      confidence: Math.floor(Math.random() * 15) + 85, // %85-100 güven
      technicalDetails: {
        paintSystem: '3-Kat Sistem (Primer + Baz + Clear)',
        primerType: 'Epoksi Primer',
        baseCoat: 'Metalik Baz Kat',
        clearCoat: 'UV Korumalı Clear Kat',
        totalThickness: Math.floor(Math.random() * 50) + 80,
        colorCode: this.getRandomColorCode() // Rastgele renk kodu
      }
    };

    // Cache'e kaydet (tutarlılık için)
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Hasar Tespiti Simülasyonu
   * 
   * Gerçek AI yerine rastgele ama gerçekçi hasar analizi üretir.
   * 1-4 arası hasar oluşturur ve detaylı rapor sağlar.
   * 
   * @param imagePath - Fotoğraf path'i (cache key için kullanılır)
   * @returns Promise<any> - Simüle hasar analiz sonucu
   * 
   * @example
   * const result = await SimpleFallbackService.detectDamage('./photo.jpg');
   * console.log(result.damageAreas.length); // 1-4 arası hasar
   */
  static async detectDamage(imagePath: string): Promise<any> {
    // Cache kontrolü
    const cacheKey = `damage_${imagePath}`;
    
    if (this.cache.has(cacheKey)) {
      console.log('📋 Cache\'den hasar analizi döndürülüyor');
      return this.cache.get(cacheKey);
    }

    console.log('🔄 Basit fallback hasar analizi başlatılıyor...');
    
    // Gerçekçi analiz süresi simülasyonu (2 saniye)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 1-4 arası rastgele hasar sayısı
    const damageCount = Math.floor(Math.random() * 4) + 1;
    const damageAreas = [];

    // Her hasar için detaylı bilgi oluştur
    for (let i = 0; i < damageCount; i++) {
      const damageTypes = ['scratch', 'dent', 'rust', 'paint_damage'];
      const severities = ['low', 'medium', 'high'];
      const type = damageTypes[Math.floor(Math.random() * damageTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      
      damageAreas.push({
        id: `damage_${i + 1}`,                                    // Hasar ID
        x: Math.floor(Math.random() * 200),                      // X koordinatı (piksel)
        y: Math.floor(Math.random() * 200),                      // Y koordinatı (piksel)
        width: Math.floor(Math.random() * 50) + 20,               // Genişlik (20-70 piksel)
        height: Math.floor(Math.random() * 50) + 20,              // Yükseklik (20-70 piksel)
        type,                                                      // Hasar tipi
        severity,                                                  // Şiddet seviyesi
        confidence: 85 + Math.floor(Math.random() * 15),         // %85-100 güven
        description: `${type} tespit edildi - ${severity} seviye`,
        area: ['front', 'rear', 'left', 'right'][Math.floor(Math.random() * 4)], // Bölge
        repairCost: 500 + Math.floor(Math.random() * 2000),      // 500-2500 TL onarım
        partsAffected: ['Gövde', 'Boya'],                         // Etkilenen parçalar
        repairPriority: severity === 'high' ? 'urgent' : severity === 'medium' ? 'normal' : 'cosmetic',
        safetyImpact: severity === 'high' ? 'medium' : 'low',
        repairMethod: 'Profesyonel onarım',
        estimatedRepairTime: severity === 'high' ? 4 : severity === 'medium' ? 2 : 1, // Saat cinsinden
        warrantyImpact: false,
        insuranceCoverage: 'partial'
      });
    }

    // Toplam onarım maliyetini hesapla
    const totalCost = damageAreas.reduce((sum, damage) => sum + damage.repairCost, 0);

    // Kapsamlı hasar raporu oluştur
    const result = {
      damageAreas,
      
      // Genel değerlendirme
      overallAssessment: {
        damageLevel: totalCost > 5000 ? 'poor' : totalCost > 2000 ? 'fair' : 'good',
        totalRepairCost: totalCost,
        insuranceStatus: totalCost > 10000 ? 'total_loss' : 'repairable',
        marketValueImpact: Math.floor(totalCost / 200),          // Piyasa değerine etkisi (%)
        detailedAnalysis: `Araçta ${damageAreas.length} adet hasar tespit edildi. Toplam onarım maliyeti ₺${totalCost.toLocaleString()}.`,
        vehicleCondition: totalCost > 4000 ? 'poor' : totalCost > 2000 ? 'fair' : 'good',
        resaleValue: Math.max(0, 100 - Math.floor(totalCost / 100)), // Yeniden satış değeri (%)
        depreciation: Math.floor(totalCost / 150)                // Değer kaybı (%)
      },
      
      // Teknik analiz
      technicalAnalysis: {
        structuralIntegrity: totalCost > 4000 ? 'moderate_damage' : 'intact',
        safetySystems: 'functional',
        mechanicalSystems: 'operational',
        electricalSystems: 'functional',
        bodyAlignment: totalCost > 3000 ? 'minor_deviation' : 'perfect',
        frameDamage: totalCost > 8000,
        airbagDeployment: false,
        seatbeltFunction: 'functional'
      },
      
      // Güvenlik değerlendirmesi
      safetyAssessment: {
        roadworthiness: totalCost > 5000 ? 'conditional' : 'safe',
        criticalIssues: totalCost > 4000 ? ['Yapısal kontrol gerekli'] : [],
        safetyRecommendations: totalCost > 3000 ? ['Onarım önerilir'] : ['Düzenli bakım yeterli'],
        inspectionRequired: totalCost > 3000,
        immediateActions: totalCost > 5000 ? ['Onarım gerekli'] : [],
        longTermConcerns: totalCost > 2000 ? ['Paslanma riski'] : []
      },
      
      // Onarım tahmini
      repairEstimate: {
        totalCost,
        laborCost: Math.floor(totalCost * 0.4),                  // İşçilik (%40)
        partsCost: Math.floor(totalCost * 0.5),                   // Parça (%50)
        paintCost: Math.floor(totalCost * 0.1),                   // Boya (%10)
        additionalCosts: 0,
        breakdown: damageAreas.map(damage => ({
          part: damage.type,
          description: damage.description,
          cost: damage.repairCost
        })),
        timeline: [
          { phase: 'Hazırlık', duration: 1, description: 'Hasar analizi' },
          { phase: 'Onarım', duration: Math.ceil(totalCost / 1000), description: 'Ana onarım' },
          { phase: 'Kontrol', duration: 1, description: 'Kalite kontrolü' }
        ],
        warranty: {
          covered: true,
          duration: '1 yıl',
          conditions: ['Profesyonel onarım']
        }
      },
      
      // Metadata
      aiProvider: 'Simple Fallback Service',
      model: 'Basic Simulation v1.0',
      confidence: 85,
      analysisTimestamp: new Date().toISOString()
    };

    // Cache'e kaydet
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Motor Sesi Analizi Simülasyonu
   * 
   * Gerçek AI yerine rastgele ama gerçekçi ses analizi üretir.
   * Frekans analizi, vibrasyon analizi ve performans metrikleri içerir.
   * 
   * @param audioPath - Ses dosyası path'i (cache key için kullanılır)
   * @param vehicleInfo - Araç bilgileri (motor tipi, hacim vb.)
   * @returns Promise<any> - Simüle ses analiz sonucu
   * 
   * @example
   * const result = await SimpleFallbackService.analyzeEngineSound('./sound.mp3', { engineType: 'Benzinli' });
   * console.log(result.engineHealth); // 'excellent', 'good', 'fair' veya 'poor'
   */
  static async analyzeEngineSound(audioPath: string, vehicleInfo: any): Promise<any> {
    // Cache kontrolü
    const cacheKey = `audio_${audioPath}`;
    
    if (this.cache.has(cacheKey)) {
      console.log('📋 Cache\'den ses analizi döndürülüyor');
      return this.cache.get(cacheKey);
    }

    console.log('🔄 Basit fallback ses analizi başlatılıyor...');
    
    // Gerçekçi analiz süresi simülasyonu (3 saniye)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Genel motor sağlığı skoru (70-95 arası)
    const overallScore = 70 + Math.floor(Math.random() * 25);
    
    // Kapsamlı ses analiz raporu
    const result = {
      overallScore,
      engineHealth: overallScore > 90 ? 'excellent' : overallScore > 80 ? 'good' : overallScore > 70 ? 'fair' : 'poor',
      
      // RPM Analizi
      rpmAnalysis: {
        idleRpm: 800 + Math.floor(Math.random() * 200),         // Rölanti devri (800-1000)
        maxRpm: 6000 + Math.floor(Math.random() * 1000),         // Max devir (6000-7000)
        rpmStability: 85 + Math.floor(Math.random() * 15),      // Devir stabilitesi (%85-100)
        rpmResponse: 80,                                         // Devir tepkisi
        rpmSmoothness: 85,                                       // Devir düzgünlüğü
        rpmConsistency: 90,                                      // Devir tutarlılığı
        rpmFluctuation: 50,                                      // Devir dalgalanması
        rpmTrend: 'stable',                                      // Devir trendi
        idleQuality: 'smooth',                                   // Rölanti kalitesi
        accelerationResponse: 85,                                // Gaz tepkisi
        decelerationResponse: 88                                 // Yavaşlama tepkisi
      },
      
      // Frekans Analizi
      frequencyAnalysis: {
        dominantFrequencies: [120, 240, 360, 480].map(freq => ({
          frequency: freq,                                       // Hz cinsinden
          amplitude: 75,                                         // Genlik
          phase: 0,                                              // Faz
          harmonic: 1,                                           // Harmonik
          source: 'engine',                                      // Kaynak
          significance: 'primary'                                // Önem
        })),
        harmonicDistortion: 5 + Math.random() * 10,             // Harmonik bozulma (%5-15)
        noiseLevel: 45 + Math.random() * 20,                     // Gürültü seviyesi (45-65 dB)
        signalToNoiseRatio: 35,                                  // Sinyal/Gürültü oranı (dB)
        frequencyStability: 90,                                  // Frekans stabilitesi (%)
        frequencyResponse: [],
        spectralAnalysis: {
          lowFrequency: 85,                                      // Düşük frekans (%85)
          midFrequency: 80,                                      // Orta frekans (%80)
          highFrequency: 75,                                     // Yüksek frekans (%75)
          ultraHighFrequency: 70,                                // Çok yüksek frekans (%70)
          frequencyBalance: 82,                                  // Frekans dengesi (%)
          spectralPurity: 88,                                    // Spektral saflık (%)
          spectralClarity: 85                                    // Spektral netlik (%)
        },
        acousticSignature: 'Normal motor sesi',
        frequencyAnomalies: []                                   // Frekans anomalileri (boş = sorun yok)
      },
      
      // Vibrasyon Analizi
      vibrationAnalysis: {
        overallVibration: 20 + Math.floor(Math.random() * 30), // Genel vibrasyon (20-50)
        engineVibration: 25,                                     // Motor vibrasyonu
        transmissionVibration: 15,                               // Şanzıman vibrasyonu
        exhaustVibration: 10,                                    // Egzoz vibrasyonu
        vibrationFrequency: 120,                                 // Vibrasyon frekansı (Hz)
        vibrationAmplitude: 0.5,                                 // Vibrasyon genliği (mm)
        vibrationDirection: 'vertical',                          // Vibrasyon yönü
        vibrationSource: 'motor',                                // Vibrasyon kaynağı
        vibrationSeverity: 'low',                                // Vibrasyon şiddeti
        vibrationImpact: 'minimal'                               // Vibrasyon etkisi
      },
      
      // Ses Kalitesi
      soundQuality: {
        overallQuality: 75 + Math.floor(Math.random() * 20),   // Genel kalite (%75-95)
        clarity: 80,                                             // Netlik
        richness: 75,                                            // Zenginlik
        smoothness: 85,                                          // Pürüzsüzlük
        consistency: 80,                                         // Tutarlılık
        pleasantness: 75,                                        // Hoşluk
        acousticBalance: 80,                                     // Akustik denge
        soundSignature: 'Normal motor',                          // Ses imzası
        qualityGrade: 'good'                                     // Kalite notu
      },
      
      detectedIssues: [],                                        // Tespit edilen sorunlar (boş = sorun yok)
      
      // Performans Metrikleri
      performanceMetrics: {
        engineEfficiency: 80,                                    // Motor verimliliği (%)
        powerOutput: 85,                                         // Güç çıkışı (%)
        torqueOutput: 80,                                        // Tork çıkışı (%)
        fuelEfficiency: 75,                                      // Yakıt verimliliği (%)
        emissionsLevel: 70,                                      // Emisyon seviyesi (%)
        accelerationPerformance: 80,                             // Hızlanma performansı (%)
        topSpeedPerformance: 85,                                 // Maksimum hız performansı (%)
        overallPerformance: 80,                                  // Genel performans (%)
        performanceTrend: 'stable',                              // Performans trendi
        performanceGrade: 'good'                                 // Performans notu
      },
      
      // Bakım Önerileri
      maintenanceRecommendations: {
        immediate: [],                                           // Acil (boş = yok)
        shortTerm: [],                                           // Kısa vadeli (boş = yok)
        longTerm: [],                                            // Uzun vadeli (boş = yok)
        preventive: [],                                          // Önleyici (boş = yok)
        emergency: [],                                           // Acil durum (boş = yok)
        seasonal: [],                                            // Mevsimlik (boş = yok)
        mileageBased: [],                                        // Kilometre bazlı (boş = yok)
        timeBased: []                                            // Zaman bazlı (boş = yok)
      },
      
      // Teknik Analiz (Detaylı - 50+ özellik)
      technicalAnalysis: {
        engineType: vehicleInfo?.engineType || 'Benzinli',
        displacement: vehicleInfo?.displacement || 1600,         // Motor hacmi (cc)
        cylinderCount: vehicleInfo?.cylinderCount || 4,          // Silindir sayısı
        fuelType: 'Benzin',
        ignitionSystem: 'Elektronik',
        fuelSystem: 'Enjeksiyon',
        exhaustSystem: 'Katalitik',
        coolingSystem: 'Sıvı soğutma',
        lubricationSystem: 'Basınçlı',
        transmissionType: 'Manuel',
        drivetrain: 'Ön çekiş',
        engineAge: 5,                                             // Motor yaşı (yıl)
        mileage: 80000,                                           // Kilometre
        maintenanceHistory: 'Normal',
        modificationHistory: 'Orijinal',
        environmentalFactors: ['Normal koşullar'],
        operatingConditions: ['Şehir içi'],
        loadConditions: ['Normal yük'],
        temperatureConditions: ['Normal sıcaklık'],
        altitudeConditions: ['Deniz seviyesi'],
        fuelQuality: 'İyi',
        oilQuality: 'İyi',
        coolantQuality: 'İyi',
        
        // 30+ parça durumu (hepsi 'İyi' = sorun yok)
        airFilterCondition: 'İyi',
        fuelFilterCondition: 'İyi',
        oilFilterCondition: 'İyi',
        sparkPlugCondition: 'İyi',
        timingBeltCondition: 'İyi',
        waterPumpCondition: 'İyi',
        alternatorCondition: 'İyi',
        starterCondition: 'İyi',
        batteryCondition: 'İyi',
        exhaustSystemCondition: 'İyi',
        catalyticConverterCondition: 'İyi',
        oxygenSensorCondition: 'İyi',
        massAirFlowSensorCondition: 'İyi',
        throttleBodyCondition: 'İyi',
        fuelInjectorCondition: 'İyi',
        fuelPumpCondition: 'İyi',
        ignitionCoilCondition: 'İyi',
        distributorCondition: 'İyi',
        camshaftCondition: 'İyi',
        crankshaftCondition: 'İyi',
        pistonCondition: 'İyi',
        cylinderWallCondition: 'İyi',
        valveCondition: 'İyi',
        valveSeatCondition: 'İyi',
        valveSpringCondition: 'İyi',
        timingChainCondition: 'İyi',
        timingGearCondition: 'İyi',
        oilPumpCondition: 'İyi',
        thermostatCondition: 'İyi',
        radiatorCondition: 'İyi',
        fanCondition: 'İyi',
        beltCondition: 'İyi',
        pulleyCondition: 'İyi',
        bearingCondition: 'İyi',
        sealCondition: 'İyi',
        gasketCondition: 'İyi',
        hoseCondition: 'İyi',
        clampCondition: 'İyi',
        mountCondition: 'İyi',
        bracketCondition: 'İyi'
      },
      
      // Metadata
      aiProvider: 'Simple Fallback Service',
      model: 'Basic Audio Analysis v1.0',
      confidence: 80,
      analysisTimestamp: new Date().toISOString()
    };

    // Cache'e kaydet
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Rastgele Renk Kodu Üreteci
   * 
   * Boya analizi için gerçekçi renk kodları döndürür.
   * Otomotiv standart renk kodlarından rastgele seçim yapar.
   * 
   * @returns string - Renk kodu (örn: '1G3 (Silver Metallic)')
   * 
   * @private
   */
  private static getRandomColorCode(): string {
    const colorCodes = [
      '1G3 (Silver Metallic)',
      '2B2 (Black Pearl)', 
      '3A3 (White Pearl)',
      '4C4 (Red Metallic)',
      '5D5 (Blue Metallic)'
    ];
    
    return colorCodes[Math.floor(Math.random() * colorCodes.length)];
  }
}
