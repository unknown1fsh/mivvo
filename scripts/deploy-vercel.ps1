# Mivvo Expertiz - Vercel Deployment Script (PowerShell)
# Bu script uygulamayı Vercel'e deploy eder

Write-Host "🚀 Mivvo Expertiz - Vercel Deployment Başlatılıyor..." -ForegroundColor Blue

# Hata kontrolü
$ErrorActionPreference = "Stop"

Write-Host "📋 Pre-deployment kontrolleri..." -ForegroundColor Blue

# Node.js versiyonu kontrolü
Write-Host "🔍 Node.js versiyonu kontrol ediliyor..." -ForegroundColor Yellow
node --version

# NPM versiyonu kontrolü
Write-Host "🔍 NPM versiyonu kontrol ediliyor..." -ForegroundColor Yellow
npm --version

# Vercel CLI kontrolü
Write-Host "🔍 Vercel CLI kontrol ediliyor..." -ForegroundColor Yellow
try {
    vercel --version
} catch {
    Write-Host "❌ Vercel CLI bulunamadı! Lütfen 'npm install -g vercel' komutunu çalıştırın." -ForegroundColor Red
    exit 1
}

# Dependencies yükleme
Write-Host "📦 Dependencies yükleniyor..." -ForegroundColor Blue
npm run install:all

# Prisma generate
Write-Host "🗄️ Prisma client generate ediliyor..." -ForegroundColor Blue
Set-Location backend
npx prisma generate
Set-Location ..

# Build test
Write-Host "🔨 Build test ediliyor..." -ForegroundColor Blue
npm run build:vercel

Write-Host "✅ Pre-deployment kontrolleri tamamlandı!" -ForegroundColor Green

# Deployment seçimi
Write-Host "🤔 Deployment türünü seçin:" -ForegroundColor Yellow
Write-Host "1) Preview deployment (test)"
Write-Host "2) Production deployment"
$choice = Read-Host "Seçiminiz (1-2)"

switch ($choice) {
    "1" {
        Write-Host "🚀 Preview deployment başlatılıyor..." -ForegroundColor Blue
        npm run deploy:preview
    }
    "2" {
        Write-Host "🚀 Production deployment başlatılıyor..." -ForegroundColor Blue
        npm run deploy
    }
    default {
        Write-Host "❌ Geçersiz seçim!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🎉 Deployment tamamlandı!" -ForegroundColor Green
Write-Host "📊 Uygulamanızı kontrol etmek için Vercel dashboard'u ziyaret edin." -ForegroundColor Blue
Write-Host "🔗 https://vercel.com/dashboard" -ForegroundColor Blue
