#!/bin/bash

echo "🚀 Mivvo Expertiz - Vercel Deployment Script"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json bulunamadı! Lütfen proje kök dizininde çalıştırın."
    exit 1
fi

echo "📦 Frontend dependencies yükleniyor..."
cd frontend
npm install

echo "🔨 Frontend build ediliyor..."
npm run build

echo "✅ Frontend build tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. Vercel hesabınıza giriş yapın: https://vercel.com"
echo "2. 'New Project' butonuna tıklayın"
echo "3. GitHub repository'nizi seçin: https://github.com/unknown1fsh/mivvo"
echo "4. Framework Preset: Next.js seçin"
echo "5. Root Directory: frontend seçin"
echo "6. Environment Variables ekleyin:"
echo "   - DATABASE_URL: Neon PostgreSQL connection string"
echo "   - JWT_SECRET: Güçlü bir secret key"
echo "   - NODE_ENV: production"
echo "7. Deploy butonuna tıklayın"
echo ""
echo "🎉 Deployment tamamlandıktan sonra domain'inizi güncelleyin!"
