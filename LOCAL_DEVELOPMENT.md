# 🚀 Local Development Setup

> 👨‍💻 **Bu kılavuz sadece local geliştirme içindir**  
> Deploy işlemleri arkadaşınız tarafından yapılacak

## 📋 Hızlı Başlangıç

### 1. Repository'yi Clone Edin
```bash
git clone https://github.com/unknown1fsh/mivvo.git
cd mivvo
```

### 2. Dependencies'leri Yükleyin
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment
```bash
cd backend
cp env.example .env
# .env dosyasını açıp kendi database şifrenizi yazın!
```

#### Frontend Environment  
```bash
cd frontend
cp .env.example .env.local
# Genelde değiştirmeniz gerekmez
```

### 4. Database Kurulumu

#### PostgreSQL Kurulumu
1. PostgreSQL'i indirin ve kurun
2. Database oluşturun:
```sql
CREATE DATABASE mivvo_expertiz;
```

#### .env Dosyasını Düzenleyin
`backend/.env` dosyasında YOUR_DB_PASSWORD yerine kendi şifrenizi yazın!

### 4. Database Migration
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Projeyi Çalıştırın

#### Backend
```bash
cd backend
npm run dev
# http://localhost:3001
```

#### Frontend
```bash
cd frontend  
npm run dev
# http://localhost:3000
```

#### Full Stack (Eş zamanlı)
```bash
# Ana dizinde
npm run dev
```

## 🔧 Development Commands

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Full stack development |
| `npm run backend` | Sadece backend |
| `npm run frontend` | Sadece frontend |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | Database'i sıfırla |

## 🗄️ Database Yönetimi

### Prisma Studio
```bash
cd backend
npx prisma studio
# http://localhost:5555
```

### Database Reset
```bash
cd backend
npx prisma migrate reset
```

### Schema Değişiklikleri
Arkadaşınız schema değişikliği yaptıysa:
```bash
git pull
cd backend
npx prisma migrate dev
npx prisma generate
```

## 📁 Proje Yapısı

```
mivvo/
├── backend/                 # API sunucu
│   ├── src/
│   ├── prisma/
│   └── .env                # Local config (sizin)
├── frontend/               # Next.js app
└── package.json           # Root scripts
```

## 🚫 Ne Yapmayın

- ❌ Production dosyalarını değiştirmeyin
- ❌ Deploy komutları çalıştırmayın  
- ❌ .env dosyasını commit etmeyin
- ❌ Vercel ayarlarını değiştirmeyin

## ✅ Sadece Bunları Yapın

- ✅ `git pull` ile güncel kodu alın
- ✅ Local'de development yapın
- ✅ Feature branch'lerde çalışın
- ✅ Code review için PR açın

## 🆘 Sorun Çözme

### Backend Çalışmıyor
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
```

### Frontend Çalışmıyor
```bash
cd frontend
npm install
rm -rf .next
npm run dev
```

### Database Sorunu
```bash
# Postgres çalışıyor mu kontrol edin
# Database var mı kontrol edin
cd backend
npx prisma studio
```

## 📞 Yardım

Sorun yaşarsanız arkadaşınızla iletişime geçin veya GitHub issue açın.

---
🎯 **Amacınız**: Local'de kod geliştirmek ve test etmek  
🚀 **Deploy**: Arkadaşınız halleder