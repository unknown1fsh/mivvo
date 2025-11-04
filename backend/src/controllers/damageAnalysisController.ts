/**
 * Damage Analysis Controller
 * Clean Architecture - Controller Layer
 * THIN Controller - Delegates all logic to Service layer
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { damageAnalysisService } from '../services/damageAnalysisService';
import { ResponseHelper } from '../utils/ResponseHelper';
import multer from 'multer';

// Multer konfigürasyonu - memory storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir'));
    }
  }
});

export class DamageAnalysisController {
  /**
   * POST /api/damage-analysis/start
   * Hasar analizi başlat
   */
  static startAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const requestData = req.body;

    // ✅ Service'e delege et - TÜM LOGIC SERVICE'TE
    const result = await damageAnalysisService.startAnalysis(userId, requestData);

    // ✅ Standard response
    ResponseHelper.created(res, result, result.message);
  });

  /**
   * POST /api/damage-analysis/:reportId/upload
   * Hasar analizi resim yükleme
   */
  static uploadImages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const reportId = parseInt(req.params.reportId);
    const files = req.files as Express.Multer.File[];

    // ✅ Service'e delege et
    const result = await damageAnalysisService.uploadImages(userId, reportId, files);

    // ✅ Standard response
    ResponseHelper.success(res, result, result.message);
  });

  /**
   * POST /api/damage-analysis/:reportId/analyze
   * AI hasar analizi gerçekleştir
   */
  static performAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const reportId = parseInt(req.params.reportId);

    // ✅ Service'e delege et - TÜM AI LOGIC SERVICE'TE
    const result = await damageAnalysisService.performAnalysis(userId, reportId);

    // ✅ Standard response
    ResponseHelper.success(res, result, 'Hasar analizi tamamlandı');
  });

  /**
   * GET /api/damage-analysis/:reportId
   * Hasar analizi raporu getir
   */
  static getReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const reportId = parseInt(req.params.reportId);

    // ✅ Service'e delege et
    const result = await damageAnalysisService.getReport(userId, reportId);

    // ✅ Standard response
    ResponseHelper.success(res, result);
  });
}

// ============================================================================
// DEPRECATED HELPER FUNCTIONS
// Bunlar artık service katmanında - backward compatibility için burada kalıyor
// ============================================================================

function generateStrengths(analysisResults: any[]): string[] {
  const strengths = [];
  const totalDamages = analysisResults.reduce((sum, result) => sum + result.damageAreas.length, 0);
  const allDamages = analysisResults.flatMap(result => result.damageAreas);
  
  if (totalDamages === 0) {
    strengths.push('🎉 Araç tamamen hasarsız durumda - Mükemmel bakım');
    strengths.push('✨ Tüm kaporta parçaları orijinal ve sağlam');
    strengths.push('💎 Boya kalitesi fabrika çıkışı gibi');
    strengths.push('🏆 Piyasa değeri maksimum seviyede');
  } else if (totalDamages <= 2) {
    strengths.push('👍 Genel durum çok iyi - Sadece kozmetik hasarlar');
    strengths.push('✅ Yapısal bütünlük tam korunmuş');
    strengths.push('💪 Güvenlik sistemleri etkilenmemiş');
  }
  
  const hasCriticalDamage = allDamages.some((d: any) => d.severity === 'critical' || d.severity === 'high');
  if (!hasCriticalDamage) {
    strengths.push('✅ Kritik seviye hasar yok - Güvenli kullanım');
    strengths.push('🛡️ Çarpışma güvenliği korunmuş');
  }
  
  const hasRust = allDamages.some((d: any) => d.type === 'rust');
  if (!hasRust) {
    strengths.push('🔒 Paslanma/korozyon tespit edilmedi');
    strengths.push('⚡ Metal yapı ve şasi sağlam');
  }
  
  const hasStructural = allDamages.some((d: any) => d.type === 'structural' || d.type === 'crack' || d.type === 'break');
  if (!hasStructural) {
    strengths.push('🏗️ Yapısal hasar yok - Şasi bütünlüğü tam');
    strengths.push('🎯 Kaza geçmişi yok (görünür hasar yok)');
  }
  
  const hasMechanical = allDamages.some((d: any) => d.type === 'mechanical');
  if (!hasMechanical) {
    strengths.push('⚙️ Mekanik parçalar hasarsız');
    strengths.push('🔧 Motor bölgesi korunmuş');
  }
  
  return strengths.length > 0 ? strengths : ['Araç genel olarak kullanılabilir durumda'];
}

function generateWeaknesses(analysisResults: any[]): string[] {
  const weaknesses = [];
  const allDamages = analysisResults.flatMap(result => result.damageAreas);
  const totalDamages = allDamages.length;
  
  if (totalDamages > 10) {
    weaknesses.push('🚨 ÇOK SAYIDA HASAR - Kapsamlı onarım gerekli');
    weaknesses.push('⚠️ Araç ağır hasar görmüş - Detaylı ekspertiz şart');
  } else if (totalDamages > 5) {
    weaknesses.push('⚠️ Orta-yüksek hasar yoğunluğu mevcut');
    weaknesses.push('🔍 Gizli hasarlar olabilir - Tam kontrol gerekli');
  } else if (totalDamages > 2) {
    weaknesses.push('📋 Birden fazla bölgede hasar var');
  }
  
  const criticalDamages = allDamages.filter((d: any) => d.severity === 'critical' || d.severity === 'high');
  if (criticalDamages.length > 0) {
    weaknesses.push(`🚨 ${criticalDamages.length} adet KRİTİK HASAR - Acil müdahale gerekli`);
    weaknesses.push('⛔ Güvenlik riski yüksek - Kullanım tehlikeli olabilir');
    weaknesses.push('🏥 Yapısal bütünlük ciddi şekilde etkilenmiş');
  }
  
  const hasRust = allDamages.some((d: any) => d.type === 'rust');
  if (hasRust) {
    weaknesses.push('🦠 PASLANMA TESPİT EDİLDİ - Korozyon ilerliyor');
    weaknesses.push('⏰ Acil müdahale edilmezse yayılacak');
  }
  
  const hasCracks = allDamages.some((d: any) => d.type === 'crack' || d.type === 'break');
  if (hasCracks) {
    weaknesses.push('💥 ÇATLAK/KIRIK HASAR - Yapısal risk var');
    weaknesses.push('🔧 Acil onarım gerekli - Güvenlik riski');
  }
  
  return weaknesses.length > 0 ? weaknesses : [];
}

function generateRecommendations(analysisResults: any[], damageSeverity: string): string[] {
  const recommendations = [];
  const allDamages = analysisResults.flatMap(result => result.damageAreas);
  
  if (damageSeverity === 'critical') {
    recommendations.push('🚨 ACİL: Aracı kullanmayın, derhal servise götürün');
    recommendations.push('⚠️ Yapısal hasar kontrolü şart');
    recommendations.push('🔍 Detaylı ekspertiz raporu alın');
  } else if (damageSeverity === 'high') {
    recommendations.push('⚠️ En kısa sürede yetkili servise götürün');
    recommendations.push('🔧 Kapsamlı onarım gerekli');
    recommendations.push('📋 Sigorta şirketini bilgilendirin');
  } else if (damageSeverity === 'medium') {
    recommendations.push('🔶 Yakın zamanda onarım planlayın');
    recommendations.push('👁️ Hasarların ilerlemesini takip edin');
    recommendations.push('💰 Onarım teklifi alın');
  } else {
    recommendations.push('✅ Düzenli bakım yaptırın');
    recommendations.push('🔍 Periyodik kontroller yapın');
  }
  
  const hasRust = allDamages.some((d: any) => d.type === 'rust');
  if (hasRust) {
    recommendations.push('🦠 Paslanma tedavisi acil - Yayılmadan önce müdahale edin');
  }
  
  const hasPaint = allDamages.some((d: any) => d.type === 'paint_damage' || d.type === 'oxidation');
  if (hasPaint) {
    recommendations.push('🎨 Boya koruma uygulaması önerilir');
  }
  
  return recommendations;
}

function generateSafetyConcerns(analysisResults: any[]): string[] {
  const concerns = [];
  const allDamages = analysisResults.flatMap(result => result.damageAreas);
  
  const criticalDamages = allDamages.filter((d: any) => d.severity === 'critical' || d.severity === 'high');
  if (criticalDamages.length > 0) {
    concerns.push(`🚨 ${criticalDamages.length} adet kritik hasar - Güvenlik riski yüksek`);
  }
  
  const structuralDamages = allDamages.filter((d: any) => 
    d.type === 'structural' || d.type === 'crack' || d.type === 'break'
  );
  if (structuralDamages.length > 0) {
    concerns.push('⚠️ Yapısal bütünlük etkilenmiş - Kaza riski var');
  }
  
  const lightDamages = allDamages.filter((d: any) => 
    d.type === 'headlight' || d.type === 'taillight'
  );
  if (lightDamages.length > 0) {
    concerns.push('💡 Aydınlatma sistemi hasarlı - Gece sürüş tehlikeli');
  }
  
  const glassDamages = allDamages.filter((d: any) => d.type === 'window' || d.type === 'crack');
  if (glassDamages.length > 0) {
    concerns.push('🪟 Cam hasarı mevcut - Görüş alanı etkilenmiş olabilir');
  }
  
  return concerns;
}

function calculateMarketValueImpact(overallScore: number, analysisResults: any[]): number {
  const totalDamages = analysisResults.reduce((sum, result) => sum + result.damageAreas.length, 0);
  const criticalDamages = analysisResults.reduce((sum, result) => 
    sum + result.damageAreas.filter((damage: any) => damage.severity === 'high').length, 0
  );
  
  const hasStructuralDamage = analysisResults.some(result => 
    result.damageAreas.some((damage: any) => 
      damage.type === 'crack' || damage.type === 'break' || damage.type === 'rust'
    )
  );
  
  const hasPaintDamage = analysisResults.some(result => 
    result.damageAreas.some((damage: any) => 
      damage.type === 'paint_damage' || damage.type === 'oxidation'
    )
  );
  
  let baseImpact = 0;
  
  if (overallScore >= 90) baseImpact = 2;
  else if (overallScore >= 80) baseImpact = 5;
  else if (overallScore >= 70) baseImpact = 8;
  else if (overallScore >= 60) baseImpact = 12;
  else if (overallScore >= 50) baseImpact = 18;
  else baseImpact = 25;
  
  if (totalDamages > 15) baseImpact += 8;
  else if (totalDamages > 10) baseImpact += 5;
  else if (totalDamages > 5) baseImpact += 3;
  
  if (criticalDamages > 3) baseImpact += 10;
  else if (criticalDamages > 1) baseImpact += 6;
  else if (criticalDamages > 0) baseImpact += 3;
  
  if (hasStructuralDamage) baseImpact += 8;
  if (hasPaintDamage) baseImpact += 4;
  
  return Math.min(baseImpact, 35);
}

// Multer upload instance'ını export et
export { upload };
