# Railway İki Ayrı Servis Deployment Guide

Bu dokümantasyon, Mivvo Expertiz uygulamasını Railway'de iki ayrı servis olarak deploy etmek için gerekli adımları açıklar.

## 🚀 Servis Yapısı

### Backend Servisi
- **Root Directory:** `backend/`
- **Port:** Railway'nin otomatik port'u (genellikle 3000-8080 arası)
- **Domain:** `https://mivvo-backend-production-xxxx.up.railway.app`
- **Health Check:** `/api/health`

### Frontend Servisi
- **Root Directory:** `frontend/`
- **Port:** Railway'nin otomatik port'u (genellikle 3000-8080 arası)
- **Domain:** `https://mivvo-frontend-production-xxxx.up.railway.app`
- **Health Check:** `/`

## 📝 Adım Adım Deployment

### 1. Backend Servisini Oluşturma

1. Railway dashboard'a gidin: https://railway.app/
2. "New Project" butonuna tıklayın
3. "Deploy from GitHub repo" seçeneğini seçin
4. Repository'nizi seçin (mivvo)
5. Service adı: `mivvo-backend`
6. **Settings** → **Service Settings**:
   - **Root Directory:** `backend/` olarak ayarlayın
   - **Start Command:** `npm run start` (otomatik algılanacak)
   - **Health Check Path:** `/api/health`

### 2. Backend Environment Variables

Railway dashboard → Backend service → **Variables** sekmesinde:

```bash
# Temel Konfigürasyon
NODE_ENV=production

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
```

### 3. Frontend Servisini Oluşturma

1. Aynı Railway projesinde "New Service" butonuna tıklayın
2. "Deploy from GitHub repo" seçeneğini seçin
3. Aynı repository'yi seçin (mivvo)
4. Service adı: `mivvo-frontend`
5. **Settings** → **Service Settings**:
   - **Root Directory:** `frontend/` olarak ayarlayın
   - **Start Command:** `npm run start` (otomatik algılanacak)
   - **Health Check Path:** `/`

### 4. Frontend Environment Variables

Railway dashboard → Frontend service → **Variables** sekmesinde:

```bash
# Temel Konfigürasyon
NODE_ENV=production

# Backend API URL (Backend servisinin Railway domain'i)
NEXT_PUBLIC_API_URL=https://mivvo-backend-production-xxxx.up.railway.app/api
```

**ÖNEMLİ:** Backend servisinin domain'ini almak için:
1. Railway dashboard → Backend service → **Settings** → **Domains**
2. Railway otomatik domain'i kopyalayın
3. Frontend environment variables'a ekleyin

### 5. Custom Domain Ekleme (Opsiyonel)

#### Backend için:
1. Railway dashboard → Backend service → **Settings** → **Domains**
2. "Add Custom Domain" butonuna tıklayın
3. Domain'inizi ekleyin (örn: `api.mivvo.com`)
4. DNS ayarlarınızı yapın

#### Frontend için:
1. Railway dashboard → Frontend service → **Settings** → **Domains**
2. "Add Custom Domain" butonuna tıklayın
3. Domain'inizi ekleyin (örn: `mivvo.com` veya `app.mivvo.com`)
4. DNS ayarlarınızı yapın

## 🔍 Deployment Sonrası Kontroller

### 1. Backend Health Check

```bash
curl https://mivvo-backend-production-xxxx.up.railway.app/api/health
```

Beklenen yanıt:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "port": 3001,
  "service": "mivvo-backend"
}
```

### 2. Frontend Health Check

```bash
curl https://mivvo-frontend-production-xxxx.up.railway.app/
```

Beklenen yanıt: HTML sayfası

### 3. API Bağlantısı Test

Browser'da frontend'i açın ve:
1. Developer Tools → Network sekmesini açın
2. Login/Register sayfasına gidin
3. API isteklerinin backend domain'ine gittiğini kontrol edin

## 🛠️ Troubleshooting

### Problem: "CORS policy violation"

**Çözüm:**
1. Backend CORS ayarlarını kontrol edin
2. Frontend domain'inin backend CORS whitelist'inde olduğundan emin olun
3. Backend environment variables'da `CORS_CREDENTIALS=true` olduğunu kontrol edin

### Problem: "API isteği başarısız"

**Çözüm:**
1. Backend servisinin çalıştığını kontrol edin (`/api/health` endpoint)
2. Frontend environment variables'da `NEXT_PUBLIC_API_URL` doğru ayarlandığından emin olun
3. Railway logs'da hata mesajlarını kontrol edin

### Problem: "Database connection failed"

**Çözüm:**
1. `DATABASE_URL` doğru format'ta olduğundan emin olun
2. Database servisinin aktif olduğunu kontrol edin
3. Prisma migration'larının çalıştığını kontrol edin

## 📊 Monitoring ve Logs

Railway dashboard'da her servis için:
- **Metrics:** CPU, Memory, Network kullanımı
- **Logs:** Real-time log görüntüleme
- **Deployments:** Deployment geçmişi
- **Variables:** Environment variables yönetimi

## 💰 Maliyet

Railway Free Tier:
- **Backend:** 500 saat/ay
- **Frontend:** 500 saat/ay
- **Database:** 1GB storage

Production için Pro plan önerilir ($5/ay per service).

## ✅ Avantajlar

1. **Port Çakışması Yok:** Her servis kendi port'unda çalışır
2. **Bağımsız Deployment:** Servisleri ayrı ayrı deploy edebilirsiniz
3. **Kolay Debugging:** Her servisin kendi logs'u var
4. **Ölçeklenebilirlik:** Servisleri bağımsız ölçeklendirebilirsiniz
5. **Güvenlik:** Backend ve frontend ayrı domain'lerde

## 🔗 Faydalı Linkler

- Railway Documentation: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- GitHub Repository: https://github.com/your-username/mivvo

