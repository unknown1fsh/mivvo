const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Renkli console çıktıları için
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironment() {
  log('🔍 Ortam kontrolü yapılıyor...', 'cyan');
  
  // Node.js versiyonu kontrolü
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    log(`❌ Node.js 18+ gerekli. Mevcut versiyon: ${nodeVersion}`, 'red');
    process.exit(1);
  }
  
  log(`✅ Node.js versiyonu: ${nodeVersion}`, 'green');
  
  // Proje kök dizinini bul
  const projectRoot = path.resolve(__dirname, '..');
  log(`📁 Proje kök dizini: ${projectRoot}`, 'cyan');
  
  // Package.json dosyalarını kontrol et
  const backendPackage = path.join(projectRoot, 'backend', 'package.json');
  const frontendPackage = path.join(projectRoot, 'frontend', 'package.json');
  
  log(`🔍 Backend package.json aranıyor: ${backendPackage}`, 'cyan');
  log(`🔍 Frontend package.json aranıyor: ${frontendPackage}`, 'cyan');
  
  if (!fs.existsSync(backendPackage)) {
    log(`❌ Backend package.json bulunamadı! Aranan yol: ${backendPackage}`, 'red');
    log(`📂 Mevcut dizin içeriği:`, 'yellow');
    try {
      const files = fs.readdirSync(projectRoot);
      files.forEach(file => log(`   - ${file}`, 'yellow'));
    } catch (err) {
      log(`   Hata: ${err.message}`, 'red');
    }
    process.exit(1);
  }
  
  if (!fs.existsSync(frontendPackage)) {
    log(`❌ Frontend package.json bulunamadı! Aranan yol: ${frontendPackage}`, 'red');
    process.exit(1);
  }
  
  log('✅ Package.json dosyaları mevcut', 'green');
}

function checkDependencies() {
  log('📦 Bağımlılıklar kontrol ediliyor...', 'cyan');
  
  const projectRoot = path.resolve(__dirname, '..');
  const backendNodeModules = path.join(projectRoot, 'backend', 'node_modules');
  const frontendNodeModules = path.join(projectRoot, 'frontend', 'node_modules');
  
  if (!fs.existsSync(backendNodeModules)) {
    log('⚠️  Backend bağımlılıkları yüklenmemiş. Yükleniyor...', 'yellow');
    return false;
  }
  
  if (!fs.existsSync(frontendNodeModules)) {
    log('⚠️  Frontend bağımlılıkları yüklenmemiş. Yükleniyor...', 'yellow');
    return false;
  }
  
  log('✅ Tüm bağımlılıklar mevcut', 'green');
  return true;
}

function checkPrismaClient() {
  log('🔧 Prisma Client kontrol ediliyor...', 'cyan');
  
  const projectRoot = path.resolve(__dirname, '..');
  const prismaClientPath = path.join(projectRoot, 'backend', 'node_modules', '.prisma', 'client');
  
  if (!fs.existsSync(prismaClientPath)) {
    log('⚠️  Prisma Client generate edilmemiş. Generate ediliyor...', 'yellow');
    return false;
  }
  
  log('✅ Prisma Client mevcut', 'green');
  return true;
}

function generatePrismaClient() {
  return new Promise((resolve, reject) => {
    log('🔧 Prisma Client generate ediliyor...', 'cyan');
    
    const projectRoot = path.resolve(__dirname, '..');
    const generateProcess = spawn('npx', ['prisma', 'generate'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(projectRoot, 'backend')
    });
    
    generateProcess.on('close', (code) => {
      if (code === 0) {
        log('✅ Prisma Client başarıyla generate edildi', 'green');
        resolve();
      } else {
        log('❌ Prisma Client generate hatası', 'red');
        reject(new Error('Prisma Client generation failed'));
      }
    });
  });
}

function checkDatabaseConnection() {
  return new Promise((resolve, reject) => {
    log('🗄️  Veritabanı bağlantısı kontrol ediliyor...', 'cyan');
    
    const projectRoot = path.resolve(__dirname, '..');
    const checkProcess = spawn('npx', ['prisma', 'db', 'push', '--accept-data-loss'], {
      stdio: 'pipe',
      shell: true,
      cwd: path.join(projectRoot, 'backend')
    });
    
    let output = '';
    checkProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    checkProcess.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    checkProcess.on('close', (code) => {
      if (code === 0 || output.includes('Database is up to date')) {
        log('✅ Veritabanı bağlantısı başarılı', 'green');
        resolve();
      } else {
        log('⚠️  Veritabanı bağlantı uyarısı (devam ediliyor)', 'yellow');
        log(`Çıktı: ${output}`, 'yellow');
        resolve(); // Devam et, hata değil
      }
    });
  });
}

function installDependencies() {
  return new Promise((resolve, reject) => {
    log('📥 Bağımlılıklar yükleniyor...', 'cyan');
    
    const projectRoot = path.resolve(__dirname, '..');
    const installProcess = spawn('npm', ['run', 'install:all'], {
      stdio: 'inherit',
      shell: true,
      cwd: projectRoot
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        log('✅ Bağımlılıklar başarıyla yüklendi', 'green');
        resolve();
      } else {
        log('❌ Bağımlılık yükleme hatası', 'red');
        reject(new Error('Dependency installation failed'));
      }
    });
  });
}

function startBackend() {
  return new Promise((resolve, reject) => {
    log('🚀 Backend başlatılıyor...', 'blue');
    
    const projectRoot = path.resolve(__dirname, '..');
    const backendProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true,
      cwd: path.join(projectRoot, 'backend')
    });
    
    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server running on port')) {
        log('✅ Backend başarıyla başlatıldı', 'green');
        resolve(backendProcess);
      }
    });
    
    backendProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('Error') || error.includes('EADDRINUSE')) {
        log(`❌ Backend hatası: ${error}`, 'red');
        reject(new Error(error));
      }
    });
    
    backendProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Backend process exited with code ${code}`));
      }
    });
  });
}

function startFrontend() {
  return new Promise((resolve, reject) => {
    log('🎨 Frontend başlatılıyor...', 'magenta');
    
    const projectRoot = path.resolve(__dirname, '..');
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true,
      cwd: path.join(projectRoot, 'frontend')
    });
    
    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('Ready')) {
        log('✅ Frontend başarıyla başlatıldı', 'green');
        resolve(frontendProcess);
      }
    });
    
    frontendProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('Error') || error.includes('EADDRINUSE')) {
        log(`❌ Frontend hatası: ${error}`, 'red');
        reject(new Error(error));
      }
    });
    
    frontendProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Frontend process exited with code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    log('🎯 Mivvo Expertiz Development Server', 'bright');
    log('=====================================', 'bright');
    
    // Ortam kontrolü
    checkEnvironment();
    
    // Bağımlılık kontrolü
    const depsInstalled = checkDependencies();
    if (!depsInstalled) {
      await installDependencies();
    }
    
    // Prisma Client kontrolü
    const prismaClientReady = checkPrismaClient();
    if (!prismaClientReady) {
      await generatePrismaClient();
    }
    
    // Veritabanı bağlantı kontrolü
    await checkDatabaseConnection();
    
    log('🚀 Servisler başlatılıyor...', 'cyan');
    
    // Backend ve Frontend'i paralel başlat
    const [backendProcess, frontendProcess] = await Promise.all([
      startBackend(),
      startFrontend()
    ]);
    
    log('🎉 Tüm servisler başarıyla başlatıldı!', 'green');
    log('', 'reset');
    log('📱 Frontend: http://localhost:3000', 'cyan');
    log('🔧 Backend API: http://localhost:3001', 'cyan');
    log('🏥 Health Check: http://localhost:3001/health', 'cyan');
    log('🗄️  Prisma Studio: npx prisma studio (backend klasöründe)', 'cyan');
    log('', 'reset');
    log('Durdurmak için Ctrl+C tuşlarına basın', 'yellow');
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      log('\n🛑 Servisler durduruluyor...', 'yellow');
      
      backendProcess.kill('SIGTERM');
      frontendProcess.kill('SIGTERM');
      
      setTimeout(() => {
        log('✅ Servisler başarıyla durduruldu', 'green');
        process.exit(0);
      }, 2000);
    });
    
  } catch (error) {
    log(`❌ Hata: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
