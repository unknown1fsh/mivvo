# OAuth Setup Guide (OAuth Kurulum Rehberi)

Bu rehber, Google ve Facebook OAuth provider'larının nasıl kurulacağını adım adım açıklar.

## 📋 İçindekiler

1. [Google OAuth Setup](#google-oauth-setup)
2. [Facebook OAuth Setup](#facebook-oauth-setup)
3. [Environment Variables](#environment-variables)
4. [Test Etme](#test-etme)
5. [Troubleshooting](#troubleshooting)

---

## 🔵 Google OAuth Setup

### 1. Google Cloud Console'a Git

1. [Google Cloud Console](https://console.cloud.google.com/) adresine git
2. Google hesabınızla giriş yap

### 2. Yeni Proje Oluştur

1. Üst menüden proje seçici'ye tıkla
2. "New Project" butonuna tıkla
3. Proje adını gir: `Mivvo Expertiz OAuth`
4. "Create" butonuna tıkla

### 3. OAuth Consent Screen Yapılandır

1. Sol menüden "APIs & Services" > "OAuth consent screen" seç
2. "External" seçeneğini seç ve "Create" butonuna tıkla

#### App Information
- **App name**: `Mivvo Expertiz`
- **User support email**: Kendi email adresin
- **Developer contact information**: Kendi email adresin

#### Scopes
1. "Add or Remove Scopes" butonuna tıkla
2. Şu scope'ları ekle:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
3. "Update" butonuna tıkla

#### Test Users (Development için)
1. "Test users" bölümüne git
2. "Add Users" butonuna tıkla
3. Test email adreslerini ekle

### 4. OAuth 2.0 Credentials Oluştur

1. Sol menüden "APIs & Services" > "Credentials" seç
2. "Create Credentials" > "OAuth 2.0 Client IDs" seç
3. Application type: "Web application"
4. Name: `Mivvo Expertiz Web Client`

#### Authorized JavaScript origins
```
http://localhost:3000
https://yourdomain.com
```

#### Authorized redirect URIs
```
http://localhost:3000/api/auth/callback/google
https://yourdomain.com/api/auth/callback/google
```

5. "Create" butonuna tıkla
6. **Client ID** ve **Client Secret**'ı kopyala

---

## 🔵 Facebook OAuth Setup

### 1. Facebook Developers'a Git

1. [Facebook Developers](https://developers.facebook.com/) adresine git
2. Facebook hesabınızla giriş yap

### 2. Yeni Uygulama Oluştur

1. "My Apps" > "Create App" butonuna tıkla
2. "Consumer" seçeneğini seç
3. App details:
   - **App name**: `Mivvo Expertiz`
   - **App contact email**: Kendi email adresin
   - **App purpose**: "Other" seç
4. "Create App" butonuna tıkla

### 3. Facebook Login Ürününü Ekle

1. Dashboard'da "Add a Product" bölümüne git
2. "Facebook Login" ürününü bul ve "Set Up" butonuna tıkla
3. "Web" platformunu seç

### 4. Facebook Login Ayarları

1. Sol menüden "Facebook Login" > "Settings" seç

#### Valid OAuth Redirect URIs
```
http://localhost:3000/api/auth/callback/facebook
https://yourdomain.com/api/auth/callback/facebook
```

2. "Save Changes" butonuna tıkla

### 5. App ID ve App Secret Alma

1. Sol menüden "Settings" > "Basic" seç
2. **App ID** ve **App Secret**'ı kopyala

---

## 🔧 Environment Variables

### Backend (.env)

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=your-resend-api-key
SMTP_FROM_EMAIL=noreply@mivvo.com
SMTP_FROM_NAME=Mivvo Expertiz
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=your-database-url
```

### Frontend (.env.local)

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🧪 Test Etme

### 1. Development Ortamında Test

1. Backend ve frontend'i başlat:
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

2. Browser'da `http://localhost:3000/login` adresine git
3. Google/Facebook butonlarına tıkla
4. OAuth flow'unu test et

### 2. Production Ortamında Test

1. Domain'i OAuth provider'lara ekle
2. HTTPS kullan (OAuth provider'lar HTTP'yi production'da kabul etmez)
3. Environment variable'ları production sunucusunda ayarla

---

## 🔍 Troubleshooting

### Google OAuth Hataları

#### "Error 400: redirect_uri_mismatch"
- Google Console'da redirect URI'ları kontrol et
- Domain'in tam olarak eşleştiğinden emin ol

#### "Error 403: access_denied"
- OAuth consent screen'de test user ekle
- Scope'ların doğru olduğundan emin ol

### Facebook OAuth Hataları

#### "Invalid OAuth access token"
- Facebook App ID ve Secret'ı kontrol et
- Redirect URI'ları kontrol et

#### "App Not Setup"
- Facebook Login ürününün eklenmiş olduğundan emin ol
- App review durumunu kontrol et

### Genel Sorunlar

#### "NEXTAUTH_URL is not defined"
- `.env.local` dosyasında `NEXTAUTH_URL` tanımla
- Development için `http://localhost:3000`

#### Email gönderilmiyor
- SMTP ayarlarını kontrol et
- Resend API key'inin doğru olduğundan emin ol
- Development modunda console'a email içeriği yazdırılır

---

## 📚 Ek Kaynaklar

### Google OAuth
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

### Facebook OAuth
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Facebook Developers Console](https://developers.facebook.com/)

### NextAuth.js
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js Providers](https://next-auth.js.org/providers/)

### Email Services
- [Resend Documentation](https://resend.com/docs)
- [Nodemailer Documentation](https://nodemailer.com/about/)

---

## ✅ Checklist

### Google OAuth Setup
- [ ] Google Cloud Console'da proje oluşturuldu
- [ ] OAuth consent screen yapılandırıldı
- [ ] OAuth 2.0 credentials oluşturuldu
- [ ] Redirect URI'lar eklendi
- [ ] Client ID ve Secret alındı

### Facebook OAuth Setup
- [ ] Facebook Developers'da app oluşturuldu
- [ ] Facebook Login ürünü eklendi
- [ ] Redirect URI'lar yapılandırıldı
- [ ] App ID ve Secret alındı

### Environment Variables
- [ ] Backend .env dosyası yapılandırıldı
- [ ] Frontend .env.local dosyası yapılandırıldı
- [ ] Tüm gerekli değişkenler tanımlandı

### Test
- [ ] Development ortamında test edildi
- [ ] Google login çalışıyor
- [ ] Facebook login çalışıyor
- [ ] Email doğrulama çalışıyor
- [ ] Production ortamında test edildi

---

## 🆘 Yardım

Sorun yaşıyorsanız:

1. **Console log'ları kontrol edin** - Browser ve server console'larını inceleyin
2. **Network tab'ını kontrol edin** - API isteklerinin başarılı olup olmadığını görün
3. **Environment variable'ları kontrol edin** - Tüm gerekli değişkenlerin tanımlı olduğundan emin olun
4. **OAuth provider ayarlarını kontrol edin** - Redirect URI'lar ve domain ayarlarını doğrulayın

Bu rehberi takip ederek OAuth sisteminizi başarıyla kurabilirsiniz! 🚀
