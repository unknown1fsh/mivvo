#!/bin/bash

# Mivvo Expertiz - Vercel Deployment Script
# Bu script uygulamayı Vercel'e deploy eder

echo "🚀 Mivvo Expertiz - Vercel Deployment Başlatılıyor..."

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hata kontrolü
set -e

echo -e "${BLUE}📋 Pre-deployment kontrolleri...${NC}"

# Node.js versiyonu kontrolü
echo -e "${YELLOW}🔍 Node.js versiyonu kontrol ediliyor...${NC}"
node --version

# NPM versiyonu kontrolü
echo -e "${YELLOW}🔍 NPM versiyonu kontrol ediliyor...${NC}"
npm --version

# Vercel CLI kontrolü
echo -e "${YELLOW}🔍 Vercel CLI kontrol ediliyor...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI bulunamadı! Lütfen 'npm install -g vercel' komutunu çalıştırın.${NC}"
    exit 1
fi

vercel --version

# Dependencies yükleme
echo -e "${BLUE}📦 Dependencies yükleniyor...${NC}"
npm run install:all

# Prisma generate
echo -e "${BLUE}🗄️ Prisma client generate ediliyor...${NC}"
cd backend && npx prisma generate && cd ..

# Build test
echo -e "${BLUE}🔨 Build test ediliyor...${NC}"
npm run build:vercel

echo -e "${GREEN}✅ Pre-deployment kontrolleri tamamlandı!${NC}"

# Deployment seçimi
echo -e "${YELLOW}🤔 Deployment türünü seçin:${NC}"
echo "1) Preview deployment (test)"
echo "2) Production deployment"
read -p "Seçiminiz (1-2): " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Preview deployment başlatılıyor...${NC}"
        npm run deploy:preview
        ;;
    2)
        echo -e "${BLUE}🚀 Production deployment başlatılıyor...${NC}"
        npm run deploy
        ;;
    *)
        echo -e "${RED}❌ Geçersiz seçim!${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Deployment tamamlandı!${NC}"
echo -e "${BLUE}📊 Uygulamanızı kontrol etmek için Vercel dashboard'u ziyaret edin.${NC}"
echo -e "${BLUE}🔗 https://vercel.com/dashboard${NC}"
