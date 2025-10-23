#!/usr/bin/env node

/**
 * Prisma Optimization Script
 * 
 * Tüm controller dosyalarında Prisma Client optimizasyonunu uygular
 * Veritabanı kota tasarrufu için gerekli
 */

const fs = require('fs');
const path = require('path');

const CONTROLLERS_DIR = path.join(__dirname, '../src/controllers');

// Optimize edilecek dosyalar
const filesToOptimize = [
  'aiAnalysisController.ts',
  'reportController.ts',
  'careerController.ts',
  'contactController.ts',
  'adminController.ts',
  'engineSoundAnalysisController.ts',
  'paintAnalysisController.ts',
  'valueEstimationController.ts',
  'notificationController.ts',
  'vinController.ts',
  'vehicleGarageController.ts',
  'comprehensiveExpertiseController.ts',
  'vehicleController.ts'
];

function optimizePrismaUsage(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Eski Prisma import'unu değiştir
    const oldImport = /import\s*{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"];?\s*\n/g;
    const newImport = "import { getPrismaClient } from '../utils/prisma';\n";
    
    if (oldImport.test(content)) {
      content = content.replace(oldImport, newImport);
      
      // Prisma instance'ı değiştir
      const oldInstance = /const\s+prisma\s*=\s*new\s+PrismaClient\(\);/g;
      const newInstance = 'const prisma = getPrismaClient();';
      
      if (oldInstance.test(content)) {
        content = content.replace(oldInstance, newInstance);
        
        // Dosyayı kaydet
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Optimized: ${path.basename(filePath)}`);
        return true;
      }
    }
    
    console.log(`⏭️  Skipped: ${path.basename(filePath)} (already optimized or no changes needed)`);
    return false;
    
  } catch (error) {
    console.error(`❌ Error optimizing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Starting Prisma optimization...\n');
  
  let optimizedCount = 0;
  
  filesToOptimize.forEach(filename => {
    const filePath = path.join(CONTROLLERS_DIR, filename);
    
    if (fs.existsSync(filePath)) {
      if (optimizePrismaUsage(filePath)) {
        optimizedCount++;
      }
    } else {
      console.log(`⚠️  File not found: ${filename}`);
    }
  });
  
  console.log(`\n🎉 Optimization complete! ${optimizedCount} files optimized.`);
  console.log('💡 Benefits:');
  console.log('   - Reduced database quota usage');
  console.log('   - Better connection pooling');
  console.log('   - Optimized logging in production');
}

if (require.main === module) {
  main();
}

module.exports = { optimizePrismaUsage };
