# 🚀 Railway Deployment Rehberi

## ✅ Tamamlanan Düzeltmeler

### 1. **CORS Sorunu Çözüldü**
- ✅ Frontend API client'ı Railway domain kullanacak şekilde güncellendi
- ✅ Backend CORS middleware'i Railway domain'leri için yapılandırıldı
- ✅ Environment variables doğru şekilde ayarlandı

### 2. **JWT Token Sistemi Hazır**
- ✅ Backend'de JWT authentication middleware mevcut
- ✅ Frontend'de token yönetimi implementasyonu mevcut
- ✅ Login/Register endpoint'leri JWT token döndürüyor

### 3. **API Endpoint'leri Düzeltildi**
- ✅ Tüm API endpoint'leri `/api` prefix'i ile standardize edildi
- ✅ Frontend API client'ı doğru URL'leri kullanıyor
- ✅ Next.js API route'ları Railway internal domain kullanıyor

### 4. **Environment Variables Yapılandırıldı**
- ✅ Railway.toml dosyası güncellendi
- ✅ JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS eklendi
- ✅ Frontend ve backend için gerekli tüm env vars tanımlandı

## 🔧 Railway Dashboard'da Yapılması Gerekenler

### 1. **Environment Variables Ayarla**
Railway Dashboard → Project → Variables sekmesinde şu değişkenleri ekle:

```bash
# Zorunlu Değişkenler
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
DATABASE_URL=your-postgresql-connection-string

# Opsiyonel Değişkenler (API Keys)
OPENAI_API_KEY=your-openai-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Email Ayarları (Opsiyonel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. **JWT_SECRET Oluşturma**
Güvenli bir JWT secret oluşturmak için:
```bash
# Terminal'de çalıştır:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. **Database Bağlantısı**
- Railway'de PostgreSQL servisi oluşturun
- DATABASE_URL otomatik olarak ayarlanacak
- Migration'ları çalıştırın: `npm run migrate`

## 🚀 Deployment Adımları

### 1. **Git Commit ve Push**
```bash
git add .
git commit -m "Fix CORS, JWT auth, and API endpoints for Railway deployment"
git push origin main
```

### 2. **Railway Auto-Deploy**
- Railway otomatik olarak yeni commit'i algılayacak
- Build process başlayacak
- Environment variables otomatik yüklenecek

### 3. **Build Logs Kontrol**
Railway Dashboard → Deployments → Logs sekmesinde:
- ✅ Frontend build başarılı
- ✅ Backend build başarılı
- ✅ Database migration başarılı
- ✅ Health check başarılı

## 🧪 Test Etme

### 1. **Health Check**
```bash
curl https://your-app.railway.app/api/health
```

### 2. **Register Test**
```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 3. **Login Test**
```bash
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

## 🔍 Sorun Giderme

### CORS Hataları Devam Ederse:
1. Railway Dashboard'da environment variables'ları kontrol edin
2. Browser cache'ini temizleyin
3. Railway logs'da CORS debug mesajlarını kontrol edin

### JWT Token Hataları:
1. JWT_SECRET'in doğru ayarlandığını kontrol edin
2. Token'ın expire olmadığını kontrol edin
3. Authorization header'ın doğru format'ta olduğunu kontrol edin

### API Endpoint Hataları:
1. Frontend build'in güncel olduğunu kontrol edin
2. API client'ın doğru URL kullandığını kontrol edin
3. Network tab'da request URL'lerini kontrol edin

## 📋 Kontrol Listesi

- [ ] Environment variables ayarlandı
- [ ] JWT_SECRET oluşturuldu ve ayarlandı
- [ ] Database bağlantısı test edildi
- [ ] Frontend build başarılı
- [ ] Backend build başarılı
- [ ] Health check endpoint çalışıyor
- [ ] Register endpoint çalışıyor
- [ ] Login endpoint çalışıyor
- [ ] CORS hataları çözüldü
- [ ] Frontend-backend iletişimi çalışıyor

## 🎉 Başarılı Deployment Sonrası

Artık şunlar çalışmalı:
- ✅ Kullanıcı kaydı ve girişi
- ✅ JWT token authentication
- ✅ CORS policy compliance
- ✅ API endpoint'leri
- ✅ Frontend-backend iletişimi
- ✅ Database operations

**Not**: İlk deployment'dan sonra birkaç dakika bekleyin, Railway'in DNS propagation'ı tamamlanması için.