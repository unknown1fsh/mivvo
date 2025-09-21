#!/bin/bash

# Vercel Deployment Script - Güvenli Deployment
# Bu script Vercel'e deploy etmeden önce environment kontrolü yapar

echo "🔍 Vercel Deployment Güvenlik Kontrolü..."

# 1. .env dosyasının local olduğunu kontrol et
if [ -f "backend/.env" ]; then
    local_check=$(grep "HOFKsXa1dsYTqmh6" backend/.env)
    if [ -n "$local_check" ]; then
        echo "✅ Local .env dosyası doğru (local database şifresi kullanıyor)"
    else
        echo "❌ UYARI: .env dosyasında production şifresi olabilir!"
        echo "🛑 Deployment durduruluyor..."
        exit 1
    fi
else
    echo "⚠️  .env dosyası bulunamadı, env.example'ı kopyalayın"
fi

# 2. Production example dosyasının Vercel şifresiyle güncelli olduğunu kontrol et
if [ -f "env.production.example" ]; then
    vercel_check=$(grep "12345" env.production.example)
    if [ -n "$vercel_check" ]; then
        echo "✅ Production example dosyası Vercel şifresiyle güncelli"
    else
        echo "❌ UYARI: Production example dosyasında Vercel şifresi bulunamadı!"
    fi
fi

# 3. .gitignore kontrolü
if grep -q ".env" .gitignore; then
    echo "✅ .env dosyası .gitignore'da mevcut"
else
    echo "❌ UYARI: .env dosyası .gitignore'da yok!"
fi

echo ""
echo "🚀 Güvenlik kontrolü tamamlandı!"
echo "📋 Son kontrol listesi:"
echo "   - Vercel Dashboard'da environment variables'ları ayarladınız mı?"
echo "   - Production database şifresi: 12345"
echo "   - Local database şifresi: HOFKsXa1dsYTqmh6"
echo ""
echo "Deploy etmek için: vercel --prod"