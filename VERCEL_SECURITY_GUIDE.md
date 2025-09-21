# 🚀 Vercel Deployment Güvenlik Kılavuzu

## ⚠️ ÖNEMLİ: Database Güvenliği

### 📊 Database Konfigürasyonu

#### Local Development (Kendi bilgisayarınız)
- **Şifre**: `HOFKsXa1dsYTqmh6`
- **Database**: Local PostgreSQL
- **Dosya**: `backend/.env` (git'e commitlenmez)

#### Production (Vercel)
- **Şifre**: `12345`
- **Database**: Vercel PostgreSQL
- **Kaynak**: Vercel Dashboard Environment Variables

## 🔒 Güvenli Deployment Adımları

### 1. Local Environment Kontrolü
```bash
# backend/.env dosyasının doğru olduğunu kontrol edin
cd backend
cat .env | grep DATABASE_URL
# Çıktı: postgresql://postgres:HOFKsXa1dsYTqmh6@localhost:5432/mivvo_expertiz_local
```

### 2. Vercel Environment Variables Ayarlama

Vercel Dashboard'da şu environment variables'ları ekleyin:

```bash
DATABASE_URL=postgresql://username:12345@vercel-host/database
NODE_ENV=production
JWT_SECRET=production-super-secret-jwt-key
PORT=3001
# ... diğer production değerleri
```

### 3. Deployment Öncesi Kontrol Listesi

- [ ] `backend/.env` dosyası local database'i kullanıyor mu?
- [ ] `env.production.example` dosyası Vercel şifresiyle güncellendi mi?
- [ ] Vercel Dashboard'da environment variables doğru mu?
- [ ] `.gitignore` dosyasında `.env` dosyası var mı?

### 4. Güvenli Deployment Komutu

```bash
# Ana dizinde
vercel --prod
```

## 🛡️ Güvenlik Best Practices

### Environment Variables Yönetimi
1. **Asla** production şifrelerini git'e commitlemeyin
2. **Her zaman** farklı environment'lar için farklı şifreler kullanın
3. **Mutlaka** .env dosyalarını .gitignore'a ekleyin

### Database Güvenliği
- Local: `HOFKsXa1dsYTqmh6` (sadece development)
- Production: `12345` (sadece Vercel'de)

### Deployment Güvenlik
- Environment değişkenleri Vercel Dashboard'dan yönetin
- Local .env dosyasını asla production'a göndermeyin

## 🚨 Acil Durum

Eğer yanlışlıkla local database şifresini production'a gönderirseniz:

1. Hemen Vercel Dashboard'a girin
2. Environment Variables'ları düzeltin
3. Yeniden deploy edin
4. Database erişim loglarını kontrol edin

## 📞 İletişim

Herhangi bir güvenlik sorunu için hemen ekiple iletişime geçin!