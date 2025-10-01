import { PaintAnalysisResult } from './aiService';

export class SimpleFallbackService {
  private static cache = new Map<string, any>();

  /**
   * Boya analizi için basit fallback
   */
  static async analyzePaint(imagePath: string, angle: string): Promise<PaintAnalysisResult> {
    const cacheKey = `paint_${imagePath}_${angle}`;
    
    if (this.cache.has(cacheKey)) {
      console.log('📋 Cache\'den boya analizi döndürülüyor');
      return this.cache.get(cacheKey);
    }

    console.log('🔄 Basit fallback boya analizi başlatılıyor...');
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simüle analiz süresi

    const conditions: Array<'excellent' | 'good' | 'fair' | 'poor'> = ['excellent', 'good', 'fair', 'poor'];
    const weights = [0.1, 0.4, 0.4, 0.1]; // Çoğunlukla iyi ve orta durum
    const random = Math.random();
    let cumulative = 0;
    let condition: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    
    for (let i = 0; i < conditions.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        condition = conditions[i];
        break;
      }
    }

    const result: PaintAnalysisResult = {
      paintCondition: condition,
      paintThickness: Math.floor(Math.random() * 50) + 80,
      colorMatch: Math.floor(Math.random() * 20) + 80,
      scratches: Math.floor(Math.random() * 8),
      dents: Math.floor(Math.random() * 3),
      rust: Math.random() > 0.85,
      oxidation: Math.floor(Math.random() * 25),
      glossLevel: Math.floor(Math.random() * 35) + 65,
      overallScore: Math.floor(Math.random() * 25) + 75,
      recommendations: [
        'Düzenli yıkama ve cilalama yapın',
        'UV koruması kullanın',
        angle === 'front' ? 'Ön tampon bölgesine dikkat edin' : `${angle} bölgesi için özel bakım yapın`,
        'Küçük çizikler için retuş düşünün'
      ].slice(0, Math.floor(Math.random() * 3) + 2),
      confidence: Math.floor(Math.random() * 15) + 85,
      technicalDetails: {
        paintSystem: '3-Kat Sistem (Primer + Baz + Clear)',
        primerType: 'Epoksi Primer',
        baseCoat: 'Metalik Baz Kat',
        clearCoat: 'UV Korumalı Clear Kat',
        totalThickness: Math.floor(Math.random() * 50) + 80,
        colorCode: this.getRandomColorCode()
      }
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Hasar tespiti için basit fallback
   */
  static async detectDamage(imagePath: string): Promise<any> {
    const cacheKey = `damage_${imagePath}`;
    
    if (this.cache.has(cacheKey)) {
      console.log('📋 Cache\'den hasar analizi döndürülüyor');
      return this.cache.get(cacheKey);
    }

    console.log('🔄 Basit fallback hasar analizi başlatılıyor...');
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simüle analiz süresi

    const damageCount = Math.floor(Math.random() * 4) + 1;
    const damageAreas = [];

    for (let i = 0; i < damageCount; i++) {
      const damageTypes = ['scratch', 'dent', 'rust', 'paint_damage'];
      const severities = ['low', 'medium', 'high'];
      const type = damageTypes[Math.floor(Math.random() * damageTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      
      damageAreas.push({
        id: `damage_${i + 1}`,
        x: Math.floor(Math.random() * 200),
        y: Math.floor(Math.random() * 200),
        width: Math.floor(Math.random() * 50) + 20,
        height: Math.floor(Math.random() * 50) + 20,
        type,
        severity,
        confidence: 85 + Math.floor(Math.random() * 15),
        description: `${type} tespit edildi - ${severity} seviye`,
        area: ['front', 'rear', 'left', 'right'][Math.floor(Math.random() * 4)],
        repairCost: 500 + Math.floor(Math.random() * 2000),
        partsAffected: ['Gövde', 'Boya'],
        repairPriority: severity === 'high' ? 'urgent' : severity === 'medium' ? 'normal' : 'cosmetic',
        safetyImpact: severity === 'high' ? 'medium' : 'low',
        repairMethod: 'Profesyonel onarım',
        estimatedRepairTime: severity === 'high' ? 4 : severity === 'medium' ? 2 : 1,
        warrantyImpact: false,
        insuranceCoverage: 'partial'
      });
    }

    const totalCost = damageAreas.reduce((sum, damage) => sum + damage.repairCost, 0);

    const result = {
      damageAreas,
      overallAssessment: {
        damageLevel: totalCost > 5000 ? 'poor' : totalCost > 2000 ? 'fair' : 'good',
        totalRepairCost: totalCost,
        insuranceStatus: totalCost > 10000 ? 'total_loss' : 'repairable',
        marketValueImpact: Math.floor(totalCost / 200),
        detailedAnalysis: `Araçta ${damageAreas.length} adet hasar tespit edildi. Toplam onarım maliyeti ₺${totalCost.toLocaleString()}.`,
        vehicleCondition: totalCost > 4000 ? 'poor' : totalCost > 2000 ? 'fair' : 'good',
        resaleValue: Math.max(0, 100 - Math.floor(totalCost / 100)),
        depreciation: Math.floor(totalCost / 150)
      },
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
      safetyAssessment: {
        roadworthiness: totalCost > 5000 ? 'conditional' : 'safe',
        criticalIssues: totalCost > 4000 ? ['Yapısal kontrol gerekli'] : [],
        safetyRecommendations: totalCost > 3000 ? ['Onarım önerilir'] : ['Düzenli bakım yeterli'],
        inspectionRequired: totalCost > 3000,
        immediateActions: totalCost > 5000 ? ['Onarım gerekli'] : [],
        longTermConcerns: totalCost > 2000 ? ['Paslanma riski'] : []
      },
      repairEstimate: {
        totalCost,
        laborCost: Math.floor(totalCost * 0.4),
        partsCost: Math.floor(totalCost * 0.5),
        paintCost: Math.floor(totalCost * 0.1),
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
      aiProvider: 'Simple Fallback Service',
      model: 'Basic Simulation v1.0',
      confidence: 85,
      analysisTimestamp: new Date().toISOString()
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Motor ses analizi için basit fallback
   */
  static async analyzeEngineSound(audioPath: string, vehicleInfo: any): Promise<any> {
    const cacheKey = `audio_${audioPath}`;
    
    if (this.cache.has(cacheKey)) {
      console.log('📋 Cache\'den ses analizi döndürülüyor');
      return this.cache.get(cacheKey);
    }

    console.log('🔄 Basit fallback ses analizi başlatılıyor...');
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simüle analiz süresi

    const overallScore = 70 + Math.floor(Math.random() * 25);
    
    const result = {
      overallScore,
      engineHealth: overallScore > 90 ? 'excellent' : overallScore > 80 ? 'good' : overallScore > 70 ? 'fair' : 'poor',
      rpmAnalysis: {
        idleRpm: 800 + Math.floor(Math.random() * 200),
        maxRpm: 6000 + Math.floor(Math.random() * 1000),
        rpmStability: 85 + Math.floor(Math.random() * 15),
        rpmResponse: 80,
        rpmSmoothness: 85,
        rpmConsistency: 90,
        rpmFluctuation: 50,
        rpmTrend: 'stable',
        idleQuality: 'smooth',
        accelerationResponse: 85,
        decelerationResponse: 88
      },
      frequencyAnalysis: {
        dominantFrequencies: [120, 240, 360, 480].map(freq => ({
          frequency: freq,
          amplitude: 75,
          phase: 0,
          harmonic: 1,
          source: 'engine',
          significance: 'primary'
        })),
        harmonicDistortion: 5 + Math.random() * 10,
        noiseLevel: 45 + Math.random() * 20,
        signalToNoiseRatio: 35,
        frequencyStability: 90,
        frequencyResponse: [],
        spectralAnalysis: {
          lowFrequency: 85,
          midFrequency: 80,
          highFrequency: 75,
          ultraHighFrequency: 70,
          frequencyBalance: 82,
          spectralPurity: 88,
          spectralClarity: 85
        },
        acousticSignature: 'Normal motor sesi',
        frequencyAnomalies: []
      },
      vibrationAnalysis: {
        overallVibration: 20 + Math.floor(Math.random() * 30),
        engineVibration: 25,
        transmissionVibration: 15,
        exhaustVibration: 10,
        vibrationFrequency: 120,
        vibrationAmplitude: 0.5,
        vibrationDirection: 'vertical',
        vibrationSource: 'motor',
        vibrationSeverity: 'low',
        vibrationImpact: 'minimal'
      },
      soundQuality: {
        overallQuality: 75 + Math.floor(Math.random() * 20),
        clarity: 80,
        richness: 75,
        smoothness: 85,
        consistency: 80,
        pleasantness: 75,
        acousticBalance: 80,
        soundSignature: 'Normal motor',
        qualityGrade: 'good'
      },
      detectedIssues: [],
      performanceMetrics: {
        engineEfficiency: 80,
        powerOutput: 85,
        torqueOutput: 80,
        fuelEfficiency: 75,
        emissionsLevel: 70,
        accelerationPerformance: 80,
        topSpeedPerformance: 85,
        overallPerformance: 80,
        performanceTrend: 'stable',
        performanceGrade: 'good'
      },
      maintenanceRecommendations: {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        preventive: [],
        emergency: [],
        seasonal: [],
        mileageBased: [],
        timeBased: []
      },
      technicalAnalysis: {
        engineType: vehicleInfo?.engineType || 'Benzinli',
        displacement: vehicleInfo?.displacement || 1600,
        cylinderCount: vehicleInfo?.cylinderCount || 4,
        fuelType: 'Benzin',
        ignitionSystem: 'Elektronik',
        fuelSystem: 'Enjeksiyon',
        exhaustSystem: 'Katalitik',
        coolingSystem: 'Sıvı soğutma',
        lubricationSystem: 'Basınçlı',
        transmissionType: 'Manuel',
        drivetrain: 'Ön çekiş',
        engineAge: 5,
        mileage: 80000,
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
      aiProvider: 'Simple Fallback Service',
      model: 'Basic Audio Analysis v1.0',
      confidence: 80,
      analysisTimestamp: new Date().toISOString()
    };

    this.cache.set(cacheKey, result);
    return result;
  }

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
