'use client'

import { ComprehensiveReport } from '@/components/features/ComprehensiveReport'
import { ComprehensiveExpertiseResult } from '@/types'
import { SparklesIcon, ArrowLeftIcon, ArrowDownTrayIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const mockData: ComprehensiveExpertiseResult = {
    overallScore: 88,
    expertiseGrade: 'good',
    aiProvider: 'OpenAI',
    model: 'gpt-4o',
    confidence: 95,
    analysisTimestamp: new Date().toISOString(),
    comprehensiveSummary: {
        vehicleOverview: "Bu 2020 model Toyota Corolla 1.6 benzinli aracı toplamda 67.500 km yapılmış durumda. Araç, genel olarak yaşına ve kilometresine göre çok iyi bir kondisyonda. Tek el sahibinden alındığı düşünüldüğünde, bakım geçmişinin oldukça düzenli olduğu gözlemlenmektedir.",
        keyFindings: [
            "Tüm panellerde orijinal boya mevcut",
            "Motor performansı fabrika değerlerinde",
            "Düzenli yetkili servis bakımlı",
            "Lastik diş derinliği %85 seviyesinde"
        ],
        criticalIssues: [],
        strengths: [
            "Düşük kilometre",
            "Hasar kaydı yok",
            "Sigara içilmemiş iç mekan",
            "Garantisi devam ediyor"
        ],
        weaknesses: [
            "Ön tamponda taş izleri",
            "Silecek lastikleri değişmeli"
        ],
        overallCondition: "Mükemmel Kondisyon",
        marketPosition: "Segment Lideri",
        investmentPotential: "Yüksek"
    },
    expertOpinion: {
        recommendation: 'strongly_buy',
        reasoning: [
            "Piyasa değerinin altında fiyatlanmış",
            "Mekanik kondisyon kusursuz",
            "İkinci el piyasasında yüksek likiditeye sahip"
        ],
        riskAssessment: {
            level: 'low',
            factors: ["Kronik sorun yok", "Ağır hasar geçmişi yok"]
        },
        opportunityAssessment: {
            level: 'excellent',
            factors: ["Hızlı satış potansiyeli", "Değer artış beklentisi"]
        },
        expertNotes: [
            "Yıllık bakımı 2 ay önce yapılmış",
            "Yedek anahtarı ve kitapçıkları mevcut"
        ]
    },
    finalRecommendations: {
        immediate: [],
        shortTerm: [
            { priority: 'low', action: 'Silecek değişimi', cost: 400, benefit: 'Görüş güvenliği' }
        ],
        longTerm: [
            { priority: 'planning', action: 'Akü kontrolü', cost: 2500, benefit: 'Kış öncesi hazırlık' }
        ],
        maintenance: []
    },
    investmentDecision: {
        decision: 'excellent_investment',
        expectedReturn: 15,
        paybackPeriod: '6 ay',
        riskLevel: 'low',
        liquidityScore: 90,
        marketTiming: 'Alım Fırsatı',
        financialSummary: {
            purchasePrice: 950000,
            immediateRepairs: 400,
            monthlyMaintenance: 1000,
            estimatedResaleValue: 1100000,
            totalInvestment: 950400,
            expectedProfit: 149600,
            roi: 15.7
        }
    },
    damageAnalysis: {
        hasarAlanları: [],
        genelDeğerlendirme: {
            genelPuan: 95,
            toplamOnarımMaliyeti: 0,
            damageSeverity: 'minimal'
        }
    } as any,
    paintAnalysis: {
        paintCondition: 'excellent',
        technicalDetails: {
            totalThickness: 120,
            colorCode: '040 Super White'
        }
    } as any,
    audioAnalysis: {
        engineHealth: 'excellent',
        rpmAnalysis: { idleRpm: 800 },
        costEstimate: { totalCost: 0 }
    } as any,
    valueEstimation: {
        estimatedValue: 1050000,
        confidence: 92,
        marketPosition: 'Yüksek Talep'
    } as any
}

export default function MockReportPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Premium Gradient Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Navbar */}
                    <div className="flex items-center justify-between h-20 border-b border-white/10">
                        <Link
                            href="/dashboard"
                            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors group"
                        >
                            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                                <ArrowLeftIcon className="w-5 h-5" />
                            </div>
                            <span className="font-medium">Dashboard</span>
                        </Link>

                        <div className="flex items-center space-x-2">
                            <SparklesIcon className="w-6 h-6 text-purple-400" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                                Mivvo Expertiz
                            </span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all border border-white/10"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                <span className="font-medium">PDF İndir</span>
                            </button>
                        </div>
                    </div>

                    {/* Hero Content */}
                    <div className="py-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center space-x-3 mb-4">
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-full text-sm font-medium backdrop-blur-sm">
                                        Kapsamlı Ekspertiz
                                    </span>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-200 border border-green-500/30 rounded-full text-sm font-medium backdrop-blur-sm flex items-center">
                                        <CheckBadgeIcon className="w-4 h-4 mr-1" />
                                        Tamamlandı
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                                    Toyota Corolla
                                </h1>
                                <div className="flex items-center text-white/60 space-x-4 text-lg">
                                    <span>2020</span>
                                    <span>•</span>
                                    <span>34 ABC 123</span>
                                    <span>•</span>
                                    <span>67.500 km</span>
                                </div>
                            </div>

                            {/* Quick Stats Card */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[300px]">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-white/60">Rapor Tarihi</span>
                                    <span className="text-white font-medium">
                                        {new Date().toLocaleDateString('tr-TR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/60">Rapor ID</span>
                                    <span className="font-mono text-white/80 bg-black/20 px-2 py-1 rounded text-sm">
                                        #MOCK-123
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                <ComprehensiveReport
                    data={mockData}
                    vehicleInfo={{
                        plate: '34 ABC 123',
                        brand: 'Toyota',
                        model: 'Corolla',
                        year: 2020
                    }}
                    vehicleImages={[
                        { imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=2069&auto=format&fit=crop' }
                    ]}
                    showActions={true}
                />
            </div>
        </div>
    )
}
