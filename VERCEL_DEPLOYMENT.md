# Mivvo Expertiz - Vercel Deployment

Bu proje Vercel'de tek komutla deploy edilebilir fullstack bir uygulamadır.

## 🚀 Tek Komutla Deployment

### 1. Hazırlık
```bash
# Vercel CLI'yi global olarak yükleyin
npm install -g vercel

# Proje dependencies'lerini yükleyin
npm run install:all
```

### 2. Environment Variables Ayarlayın
Vercel dashboard'da aşağıdaki environment variables'ları ekleyin:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# CORS
CORS_ORIGIN=https://www.mivvo.org

# JWT
JWT_SECRET=your-super-secret-jwt-key

# AI Services
OPENAI_API_KEY=your-openai-api-key
GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://www.mivvo.org

# OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# reCAPTCHA
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### 3. Tek Komutla Deploy
```bash
# Production'a deploy
npm run deploy

# Preview'a deploy
npm run deploy:preview
```

## 📁 Proje Yapısı

```
mivvo/
├── api/                    # Vercel serverless functions
│   └── index.ts           # Ana API handler
├── frontend/              # Next.js frontend
│   ├── app/              # App router
│   ├── components/        # React components
│   └── package.json      # Frontend dependencies
├── backend/               # Backend source (referans)
├── vercel.json           # Vercel konfigürasyonu
└── package.json          # Ana package.json
```

## 🔧 Vercel Konfigürasyonu

`vercel.json` dosyası şu özellikleri içerir:

- **Frontend**: Next.js app router ile
- **Backend**: Serverless functions ile
- **Routing**: API route'ları otomatik yönlendirme
- **Environment**: Production environment variables
- **Functions**: Node.js 18.x runtime

## 🛠️ Geliştirme

### Local Development
```bash
# Frontend'i çalıştır
npm run dev:frontend

# Backend'i çalıştır (ayrı terminal)
npm run dev:backend

# Her ikisini birden
npm run dev:local
```

### Build
```bash
# Frontend build
npm run build:frontend

# Vercel için build
npm run build:vercel
```

## 📊 API Endpoints

### Auth
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/oauth` - OAuth girişi

### User
- `GET /api/user/profile` - Kullanıcı profili
- `GET /api/user/credits` - Kredi bakiyesi

### Vehicle
- `GET /api/vehicle` - Kullanıcı araçları
- `POST /api/vehicle` - Yeni araç ekle

### Analysis
- `POST /api/paint-analysis` - Boya analizi
- `POST /api/damage-analysis` - Hasar analizi
- `POST /api/engine-sound-analysis` - Motor ses analizi

### Reports
- `GET /api/reports` - Kullanıcı raporları

### Admin
- `GET /api/admin/users` - Tüm kullanıcılar

## 🔒 Güvenlik

- JWT authentication
- Rate limiting (15 dakikada 100 istek)
- CORS koruması
- Helmet security headers
- Input validation

## 📈 Monitoring

- Health check: `/api/health`
- Error logging
- Request logging
- Database connection monitoring

## 🚀 Production Checklist

- [ ] Environment variables ayarlandı
- [ ] Database bağlantısı test edildi
- [ ] CORS origin'leri güncellendi
- [ ] JWT secret güçlü bir değer
- [ ] AI API key'leri aktif
- [ ] Email servisi yapılandırıldı
- [ ] reCAPTCHA keys ayarlandı

## 📞 Destek

Herhangi bir sorun için:
- GitHub Issues
- Email: support@mivvo.org
- Dokümantasyon: https://docs.mivvo.org
