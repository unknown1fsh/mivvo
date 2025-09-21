# Vercel Deployment Script - Güvenli Deployment (PowerShell)
# Bu script Vercel'e deploy etmeden önce environment kontrolü yapar

Write-Host "🔍 Vercel Deployment Güvenlik Kontrolü..." -ForegroundColor Cyan

# 1. .env dosyasının local olduğunu kontrol et
if (Test-Path "backend\.env") {
    $localCheck = Select-String -Path "backend\.env" -Pattern "HOFKsXa1dsYTqmh6"
    if ($localCheck) {
        Write-Host "✅ Local .env dosyası doğru (local database şifresi kullanıyor)" -ForegroundColor Green
    } else {
        Write-Host "❌ UYARI: .env dosyasında production şifresi olabilir!" -ForegroundColor Red
        Write-Host "🛑 Deployment durduruluyor..." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  .env dosyası bulunamadı, env.example'ı kopyalayın" -ForegroundColor Yellow
}

# 2. Production example dosyasının Vercel şifresiyle güncelli olduğunu kontrol et
if (Test-Path "env.production.example") {
    $vercelCheck = Select-String -Path "env.production.example" -Pattern "12345"
    if ($vercelCheck) {
        Write-Host "✅ Production example dosyası Vercel şifresiyle güncelli" -ForegroundColor Green
    } else {
        Write-Host "❌ UYARI: Production example dosyasında Vercel şifresi bulunamadı!" -ForegroundColor Red
    }
}

# 3. .gitignore kontrolü
if (Select-String -Path ".gitignore" -Pattern ".env") {
    Write-Host "✅ .env dosyası .gitignore'da mevcut" -ForegroundColor Green
} else {
    Write-Host "❌ UYARI: .env dosyası .gitignore'da yok!" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Güvenlik kontrolü tamamlandı!" -ForegroundColor Green
Write-Host "📋 Son kontrol listesi:" -ForegroundColor Yellow
Write-Host "   - Vercel Dashboard'da environment variables'ları ayarladınız mı?" -ForegroundColor White
Write-Host "   - Production database şifresi: 12345" -ForegroundColor White
Write-Host "   - Local database şifresi: HOFKsXa1dsYTqmh6" -ForegroundColor White
Write-Host ""
Write-Host "Deploy etmek için: vercel --prod" -ForegroundColor Cyan