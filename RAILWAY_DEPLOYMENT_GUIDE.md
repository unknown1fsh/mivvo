# Railway Deployment Guide

Bu dokümantasyon, Mivvo Expertiz uygulamasını Railway'e deploy etmek için gerekli adımları açıklar.

## Railway Deployment Seçenekleri

### Seçenek A: İki Ayrı Servis (Önerilen)

**Avantajları:**
- Daha iyi ölçeklenebilirlik
- Bağımsız deployment
- Daha temiz mimari
- Her servis için ayrı resource allocation

**Deployment Adımları:**

#### 1. Backend Servisi Oluşturma

1. Railway dashboard'a gidin
2. "New Project" → "Deploy from GitHub repo"
3. Repository'yi seçin
4. **Root Directory:** `backend/` olarak ayarlayın
5. Service adı: `mivvo-backend`

#### 2. Frontend Servisi Oluşturma

1. Aynı projede "New Service" → "Deploy from GitHub repo"
2. Aynı repository'yi seçin
3. **Root Directory:** `frontend/` olarak ayarlayın
4. Service adı: `mivvo-frontend`

### Seçenek B: Tek Monorepo Servis

**Avantajları:**
- Daha ekonomik (tek servis)
- Basit deployment

**Dezavantajları:**
- Daha karmaşık konfigürasyon
- Resource paylaşımı

## Environment Variables

### Backend Servisi Environment Variables

Railway dashboard → Backend service → Variables sekmesinde şunları ekleyin:

```bash
# Temel Konfigürasyon
NODE_ENV=production
PORT=3001

# Veritabanı (Neon veya Railway Postgres)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Güvenlik
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Şifreleme
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key

# CORS
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AI Servisleri
OPENAI_API_KEY=your-openai-api-key
AI_MODEL_VERSION=v1.0
AI_PROCESSING_TIMEOUT=300000

# Email (Opsiyonel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@mivvo.com

# Payment (Opsiyonel)
PAYMENT_PROVIDER=iyzico
IYZICO_API_KEY=your-iyzico-api-key
IYZICO_SECRET_KEY=your-iyzico-secret-key
IYZICO_BASE_URL=https://api.iyzipay.com

# External APIs (Opsiyonel)
GOOGLE_MAPS_API_KEY=your-google-maps-key
VEHICLE_API_KEY=your-vehicle-api-key
```

### Frontend Servisi Environment Variables

Railway dashboard → Frontend service → Variables sekmesinde şunları ekleyin:

```bash
# Temel Konfigürasyon
NODE_ENV=production

# Backend API URL (Backend servisinin Railway domain'i)
NEXT_PUBLIC_API_URL=https://mivvo-backend-production-xxxx.up.railway.app/api

# Diğer Frontend Variables (Opsiyonel)
NEXT_PUBLIC_APP_NAME=Mivvo Expertiz
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Railway Domain'lerini Bulma

1. Railway dashboard'da her servise tıklayın
2. "Settings" → "Domains" sekmesine gidin
3. Railway otomatik domain'i kopyalayın:
   - Backend: `https://mivvo-backend-production-xxxx.up.railway.app`
   - Frontend: `https://mivvo-frontend-production-xxxx.up.railway.app`

## Deployment Sonrası Kontroller

### 1. Backend Health Check

```bash
curl https://your-backend-domain.railway.app/health
```

Beklenen yanıt:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### 2. Frontend API Bağlantısı

Browser Developer Tools → Network sekmesinde:
- Login/Register isteklerinin backend'e gittiğini kontrol edin
- CORS hataları olmadığını doğrulayın

### 3. Database Bağlantısı

Railway logs'da database bağlantı hataları olmadığını kontrol edin.

## Troubleshooting

### Problem: "CORS policy violation"

**Çözüm:**
1. Backend CORS ayarlarını kontrol edin
2. Frontend domain'inin Railway domain'i olduğundan emin olun
3. `NEXT_PUBLIC_API_URL` doğru ayarlandığından emin olun

### Problem: "API isteği başarısız"

**Çözüm:**
1. Backend servisinin çalıştığını kontrol edin (`/health` endpoint)
2. Environment variables'ların doğru ayarlandığını kontrol edin
3. Railway logs'da hata mesajlarını kontrol edin

### Problem: "Database connection failed"

**Çözüm:**
1. `DATABASE_URL` doğru format'ta olduğundan emin olun
2. Database servisinin aktif olduğunu kontrol edin
3. Prisma migration'larının çalıştığını kontrol edin

## Railway CLI (Opsiyonel)

Railway CLI ile deployment'ı yönetmek için:

```bash
# Railway CLI kurulumu
npm install -g @railway/cli

# Login
railway login

# Proje seçimi
railway link

# Environment variables ekleme
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=your-database-url

# Logs görüntüleme
railway logs

# Deployment
railway up
```

## Monitoring ve Logs

Railway dashboard'da:
- **Metrics:** CPU, Memory, Network kullanımı
- **Logs:** Real-time log görüntüleme
- **Deployments:** Deployment geçmişi
- **Variables:** Environment variables yönetimi

## Güvenlik Notları

1. **JWT_SECRET:** En az 32 karakter, karmaşık string kullanın
2. **Database:** Production database için güçlü şifreler
3. **API Keys:** Gerçek API key'leri kullanın, test key'leri değil
4. **CORS:** Sadece gerekli domain'lere izin verin

## Maliyet Optimizasyonu

Railway Free Tier:
- **Backend:** 500 saat/ay
- **Frontend:** 500 saat/ay
- **Database:** 1GB storage

Production için Pro plan önerilir ($5/ay per service).

## Destek

Sorunlar için:
1. Railway documentation: https://docs.railway.app/
2. Railway Discord: https://discord.gg/railway
3. GitHub Issues: Repository'deki issues sekmesi
