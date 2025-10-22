/**
 * Test Page for Unified Report System
 * 
 * Bu sayfa yeni birleşik rapor sistemini test etmek için oluşturulmuştur
 * /test-reports route'u için
 */

'use client';

import { useState } from 'react';
import { UnifiedReportView, UnifiedReportData } from '@/components/features/UnifiedReportView';
import { ReportLoading } from '@/components/ui/ReportLoading';
import { ReportError } from '@/components/ui/ReportError';

// Test verileri
const testReports: { [key: string]: UnifiedReportData } = {
  'damage-test': {
    id: 'damage-test',
    type: 'damage',
    data: {
      overallScore: 75,
      damageSeverity: 'medium',
      estimatedRepairCost: 15000,
      estimatedRepairTime: 3,
      damageAreas: [
        {
          location: 'Ön Tampon',
          severity: 'medium',
          description: 'Hafif çizik ve göçük',
          estimatedCost: 8000
        },
        {
          location: 'Sol Yan Kapı',
          severity: 'low',
          description: 'Yüzey çizikleri',
          estimatedCost: 7000
        }
      ],
      detectedIssues: [
        {
          type: 'Çizik',
          severity: 'medium',
          confidence: 85,
          description: 'Ön tamponda çizik tespit edildi',
          symptoms: ['Görsel hasar', 'Boya kaybı'],
          recommendedActions: ['Boyama', 'Polişaj']
        }
      ],
      recommendations: {
        immediate: ['Ön tampon onarımı'],
        longTerm: ['Düzenli bakım']
      },
      safetyAssessment: {
        status: 'Güvenli',
        riskFactors: ['Görsel hasar'],
        recommendations: ['Onarım önerilir']
      },
      costBreakdown: [
        { category: 'Boyama', description: 'Ön tampon boyama', cost: 8000 },
        { category: 'Polişaj', description: 'Yan kapı polişaj', cost: 7000 }
      ]
    },
    vehicleInfo: {
      plate: '34ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      vin: '1HGBH41JXMN109186'
    },
    createdAt: new Date().toISOString(),
    status: 'completed',
    images: [],
    charts: []
  },
  'paint-test': {
    id: 'paint-test',
    type: 'paint',
    data: {
      overallScore: 85,
      paintQuality: 'good',
      costEstimate: {
        totalCost: 12000,
        breakdown: [
          { category: 'Boya', description: 'Renk eşleştirme', cost: 8000 },
          { category: 'Clear Coat', description: 'Şeffaf kat', cost: 4000 }
        ]
      },
      colorAnalysis: {
        colorCode: '1G3',
        colorName: 'Gümüş Metalik',
        isMetallic: true,
        isPearl: false,
        colorMatch: 95,
        glossLevel: 88,
        saturation: 75
      },
      surfaceAnalysis: {
        smoothness: 90,
        evenness: 85,
        thickness: 120,
        scratches: 3,
        dents: 1,
        oxidation: 5
      },
      paintDamageAssessment: {
        overallCondition: 'İyi',
        damageLevel: 'Düşük',
        repairNeeded: true,
        damageTypes: ['Hafif çizikler', 'Güneş hasarı']
      },
      technicalDetails: {
        primerThickness: 25,
        paintThickness: 80,
        clearCoatThickness: 15,
        adhesion: 95,
        hardness: 'H',
        uvResistance: 90
      },
      paintRecommendations: {
        maintenance: ['Düzenli yıkama', 'Balm uygulaması'],
        improvements: ['Polişaj', 'Seramik kaplama']
      }
    },
    vehicleInfo: {
      plate: '06XYZ789',
      brand: 'BMW',
      model: '3 Series',
      year: 2019,
      vin: 'WBA3A5C58EF123456'
    },
    createdAt: new Date().toISOString(),
    status: 'completed',
    images: [],
    charts: []
  },
  'audio-test': {
    id: 'audio-test',
    type: 'audio',
    data: {
      overallScore: 80,
      engineHealth: 'good',
      costEstimate: {
        totalCost: 5000,
        breakdown: [
          { category: 'Motor Bakımı', description: 'Genel bakım', cost: 3000 },
          { category: 'Filtre Değişimi', description: 'Hava filtresi', cost: 2000 }
        ]
      },
      rpmAnalysis: {
        idleRpm: 800,
        maxRpm: 6500,
        rpmStability: 95,
        rpmResponse: 90,
        idleQuality: 'Smooth'
      },
      soundQuality: {
        overallQuality: 85,
        clarity: 90,
        smoothness: 80,
        consistency: 85,
        soundSignature: 'Normal motor sesi'
      },
      frequencyAnalysis: {
        dominantFrequencies: [120, 240, 360],
        harmonicDistortion: 5,
        noiseLevel: 65
      },
      detectedIssues: [
        {
          type: 'Hafif Titreşim',
          severity: 'low',
          confidence: 75,
          description: 'Motor çalışırken hafif titreşim',
          symptoms: ['Titreşim', 'Ses değişikliği'],
          recommendedActions: ['Motor bakımı', 'Filtre kontrolü']
        }
      ],
      performanceMetrics: {
        engineEfficiency: 85,
        fuelEfficiency: 80,
        overallPerformance: 82,
        performanceGrade: 'B+'
      },
      recommendations: {
        immediate: ['Motor bakımı'],
        shortTerm: ['Filtre değişimi'],
        longTerm: ['Düzenli servis']
      }
    },
    vehicleInfo: {
      plate: '35DEF456',
      brand: 'Mercedes',
      model: 'C-Class',
      year: 2021,
      vin: 'WDD2050461A123456'
    },
    createdAt: new Date().toISOString(),
    status: 'completed',
    images: [],
    charts: []
  },
  'value-test': {
    id: 'value-test',
    type: 'value',
    data: {
      estimatedValue: 450000,
      confidence: 88,
      marketAnalysis: {
        currentMarketValue: 440000,
        marketTrend: 'Stabil',
        demandLevel: 'Yüksek',
        supplyLevel: 'Orta',
        regionalVariation: 'Düşük',
        seasonalImpact: 'Orta',
        priceRange: {
          min: 400000,
          max: 500000,
          average: 450000
        },
        marketInsights: ['Popüler model', 'İyi durumda']
      },
      vehicleCondition: {
        overallCondition: 'İyi',
        conditionScore: 85,
        mileageImpact: 'Normal',
        ageImpact: 'Az',
        accidentHistory: false,
        ownershipHistory: 'Tek sahip',
        serviceRecords: true,
        modifications: ['Spor jantlar']
      },
      priceBreakdown: {
        baseValue: 400000,
        mileageAdjustment: 20000,
        conditionAdjustment: 15000,
        featuresAdjustment: 10000,
        marketAdjustment: 5000,
        regionalAdjustment: 0,
        seasonalAdjustment: 0,
        finalValue: 450000
      },
      marketPosition: {
        percentile: 75,
        competitivePosition: 'İyi',
        pricingStrategy: 'Piyasa ortalaması',
        targetBuyers: ['Genç profesyoneller', 'Aileler'],
        marketAdvantages: ['Güvenilir marka', 'Düşük yakıt tüketimi'],
        marketDisadvantages: ['Yüksek fiyat', 'Servis maliyeti']
      },
      investmentAnalysis: {
        riskLevel: 'low',
        investmentGrade: 'A',
        appreciationPotential: 'Düşük',
        depreciationRate: 'Normal',
        liquidityScore: 85,
        financialSummary: {
          purchasePrice: 450000,
          immediateRepairs: 0,
          monthlyMaintenance: '500 TL',
          estimatedResaleValue: 380000,
          expectedProfit: -70000,
          roi: -15.6,
          totalInvestment: 450000
        }
      },
      recommendations: {
        sellingPrice: {
          min: 420000,
          optimal: 450000,
          max: 480000
        },
        buyingPrice: {
          min: 400000,
          optimal: 430000,
          max: 450000
        },
        negotiationTips: ['Servis kayıtlarını göster', 'Tek sahip olduğunu vurgula'],
        timingAdvice: ['İlkbahar satışı önerilir', 'Piyasa koşullarını takip et'],
        improvementSuggestions: [
          {
            action: 'Seramik kaplama',
            valueIncrease: 15000,
            cost: 8000,
            description: 'Araç değerini artırır'
          }
        ]
      }
    },
    vehicleInfo: {
      plate: '41GHI789',
      brand: 'Audi',
      model: 'A4',
      year: 2020,
      vin: 'WAUZZZ8V2LA123456'
    },
    createdAt: new Date().toISOString(),
    status: 'completed',
    images: [],
    charts: []
  },
  'comprehensive-test': {
    id: 'comprehensive-test',
    type: 'comprehensive',
    data: {
      overallScore: 82,
      expertiseGrade: 'good',
      expertOpinion: {
        recommendation: 'buy',
        reasoning: [
          'Genel durum iyi',
          'Düşük kilometre',
          'Tek sahip'
        ],
        expertNotes: [
          'Motor sağlığı iyi',
          'Boya kalitesi orta',
          'Değer uygun'
        ],
        riskAssessment: {
          level: 'Düşük',
          factors: ['Yaş', 'Kilometre']
        },
        opportunityAssessment: {
          level: 'Orta',
          factors: ['Piyasa durumu', 'Model popülerliği']
        }
      },
      investmentDecision: {
        decision: 'good_investment',
        expectedReturn: 8,
        paybackPeriod: '3 yıl',
        riskLevel: 'Düşük',
        liquidityScore: 80,
        marketTiming: 'İyi',
        financialSummary: {
          purchasePrice: 450000,
          immediateRepairs: 10000,
          monthlyMaintenance: '600 TL',
          estimatedResaleValue: 400000,
          expectedProfit: -60000,
          roi: -13.3,
          totalInvestment: 460000
        }
      },
      comprehensiveSummary: {
        vehicleOverview: 'Genel durumu iyi olan, düşük kilometreli araç',
        strengths: ['Düşük kilometre', 'Tek sahip', 'İyi motor durumu'],
        weaknesses: ['Boya kalitesi orta', 'Yaş'],
        overallCondition: 'İyi',
        marketPosition: 'Orta',
        investmentPotential: 'Orta'
      },
      damageAnalysis: {
        overallScore: 75,
        damageSeverity: 'medium'
      },
      paintAnalysis: {
        overallScore: 80,
        paintQuality: 'good'
      },
      audioAnalysis: {
        overallScore: 85,
        engineHealth: 'good'
      },
      valueEstimation: {
        estimatedValue: 450000,
        confidence: 88
      },
      finalRecommendations: {
        immediate: [
          {
            action: 'Motor bakımı',
            cost: 5000,
            benefit: 'Motor sağlığını korur',
            priority: 'Yüksek'
          }
        ],
        shortTerm: [
          {
            action: 'Boya iyileştirme',
            cost: 8000,
            benefit: 'Değer artışı',
            priority: 'Orta'
          }
        ],
        longTerm: [
          {
            action: 'Düzenli bakım',
            cost: 2000,
            benefit: 'Uzun vadeli koruma',
            priority: 'Düşük'
          }
        ],
        maintenance: [
          {
            action: 'Yağ değişimi',
            cost: 800,
            frequency: '6 ay'
          },
          {
            action: 'Filtre kontrolü',
            cost: 500,
            frequency: '12 ay'
          }
        ]
      }
    },
    vehicleInfo: {
      plate: '07JKL012',
      brand: 'Volkswagen',
      model: 'Passat',
      year: 2019,
      vin: 'WVWZZZ3CZME123456'
    },
    createdAt: new Date().toISOString(),
    status: 'completed',
    images: [],
    charts: []
  }
};

export default function TestReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestReport = (reportId: string) => {
    setIsLoading(true);
    setError(null);
    
    // Simüle edilmiş loading
    setTimeout(() => {
      setSelectedReport(reportId);
      setIsLoading(false);
    }, 2000);
  };

  const handleBack = () => {
    setSelectedReport(null);
    setIsLoading(false);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(false);
  };

  const simulateError = () => {
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      setIsLoading(false);
      setError('Test hatası: Rapor yüklenemedi');
    }, 1500);
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setError(null);
    setSelectedReport(null);
    
    setTimeout(() => {
      setIsLoading(false);
      setError('Timeout: Rapor oluşturma süresi aşıldı');
    }, 5000);
  };

  if (isLoading) {
    return (
      <ReportLoading
        type="comprehensive"
        vehicleInfo={{
          make: 'Test',
          model: 'Vehicle',
          year: 2023,
          plate: 'TEST123'
        }}
        progress={75}
        estimatedTime="2-3 dakika"
      />
    );
  }

  if (error) {
    return (
      <ReportError
        type="generic"
        message={error}
        onRetry={handleRetry}
        showDashboardLink={true}
        showSupportLink={true}
      />
    );
  }

  if (selectedReport && testReports[selectedReport]) {
    return (
      <UnifiedReportView
        reportData={testReports[selectedReport]}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Birleşik Rapor Sistemi Test Sayfası
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Yeni birleşik rapor sistemini test etmek için aşağıdaki butonları kullanabilirsiniz. 
            Her rapor türü için örnek veriler hazırlanmıştır.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Hasar Analizi Test */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-2xl">🔧</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hasar Analizi</h3>
                <p className="text-sm text-gray-500">Toyota Corolla 2020</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Orta seviye hasarlar, onarım maliyeti ve güvenlik değerlendirmesi
            </p>
            <button
              onClick={() => handleTestReport('damage-test')}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Test Et
            </button>
          </div>

          {/* Boya Analizi Test */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-2xl">🎨</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Boya Analizi</h3>
                <p className="text-sm text-gray-500">BMW 3 Series 2019</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Renk analizi, yüzey kalitesi ve teknik detaylar
            </p>
            <button
              onClick={() => handleTestReport('paint-test')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Et
            </button>
          </div>

          {/* Motor Ses Analizi Test */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-2xl">🔊</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Motor Ses Analizi</h3>
                <p className="text-sm text-gray-500">Mercedes C-Class 2021</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              RPM analizi, ses kalitesi ve performans metrikleri
            </p>
            <button
              onClick={() => handleTestReport('audio-test')}
              className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Test Et
            </button>
          </div>

          {/* Değer Tahmini Test */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Değer Tahmini</h3>
                <p className="text-sm text-gray-500">Audi A4 2020</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Pazar analizi, fiyat kırılımı ve yatırım değerlendirmesi
            </p>
            <button
              onClick={() => handleTestReport('value-test')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Et
            </button>
          </div>

          {/* Kapsamlı Ekspertiz Test */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Kapsamlı Ekspertiz</h3>
                <p className="text-sm text-gray-500">Volkswagen Passat 2019</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Tüm analizlerin birleşimi ve uzman görüşü
            </p>
            <button
              onClick={() => handleTestReport('comprehensive-test')}
              className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Test Et
            </button>
          </div>

          {/* Test Butonları */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-2xl">🧪</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Test Senaryoları</h3>
                <p className="text-sm text-gray-500">Hata ve loading testleri</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={simulateError}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Hata Testi
              </button>
              <button
                onClick={simulateLoading}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              >
                Loading Testi
              </button>
            </div>
          </div>
        </div>

        {/* Özellikler */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">✨ Yeni Özellikler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Birleşik Rapor Sistemi</h4>
                <p className="text-sm text-gray-600">Tüm rapor türleri tek sayfada</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Türkçe PDF Desteği</h4>
                <p className="text-sm text-gray-600">Roboto font ile karakter desteği</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Polling Sistemi</h4>
                <p className="text-sm text-gray-600">Gerçek zamanlı durum takibi</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Gelişmiş Hata Yönetimi</h4>
                <p className="text-sm text-gray-600">Kullanıcı dostu hata mesajları</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Modern Loading Ekranı</h4>
                <p className="text-sm text-gray-600">Animasyonlu progress gösterimi</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Responsive Tasarım</h4>
                <p className="text-sm text-gray-600">Mobil uyumlu arayüz</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
