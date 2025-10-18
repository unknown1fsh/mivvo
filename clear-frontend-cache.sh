#!/bin/bash

# Frontend build cache temizleme scripti
echo "🧹 Frontend build cache temizleniyor..."

# Frontend dizinine git
cd frontend

# Next.js cache temizle
echo "📁 .next klasörü temizleniyor..."
rm -rf .next

# Node modules temizle (opsiyonel)
echo "📦 node_modules temizleniyor..."
rm -rf node_modules

# Package lock dosyasını temizle
echo "🔒 package-lock.json temizleniyor..."
rm -f package-lock.json

# Yeniden install
echo "📥 Dependencies yeniden yükleniyor..."
npm install

echo "✅ Frontend cache temizleme tamamlandı!"
echo "🚀 Şimdi Railway'e deploy edebilirsiniz."
