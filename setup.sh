#!/bin/bash

echo "Mivvo Expertiz Projesi Kurulumu Başlatılıyor..."
echo

echo "1. Backend bağımlılıkları yükleniyor..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Backend bağımlılıkları yüklenirken hata oluştu!"
    exit 1
fi

echo "2. Prisma Client oluşturuluyor..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "Prisma Client oluşturulurken hata oluştu!"
    exit 1
fi

echo "3. Frontend bağımlılıkları yükleniyor..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "Frontend bağımlılıkları yüklenirken hata oluştu!"
    exit 1
fi

echo "4. Environment dosyaları oluşturuluyor..."
cd ../backend
if [ ! -f .env ]; then
    cp env.example .env
    echo "Backend .env dosyası oluşturuldu. Lütfen gerekli ayarları yapın."
fi

cd ../frontend
if [ ! -f .env.local ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
    echo "Frontend .env.local dosyası oluşturuldu."
fi

echo
echo "✅ Kurulum tamamlandı!"
echo
echo "Başlatmak için:"
echo "  Backend: cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo
echo "Veritabanı bağlantısını kontrol etmeyi unutmayın!"
echo
