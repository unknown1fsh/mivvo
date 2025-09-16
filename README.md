# 🚗 Mivvo Expertiz - Yeni Nesil Oto Expertiz

Modern AI destekli araç expertiz uygulaması. Kullanıcılar araçlarının resimlerini yükleyerek AI analizi ile detaylı expertiz raporları alabilirler.

## ✨ Özellikler

### 🤖 AI Destekli Analiz
- **Boya Analizi**: Otomatik boya kalitesi değerlendirmesi
- **Hasar Tespiti**: Çizik, çukur ve hasar tespiti
- **Değer Tahmini**: AI destekli araç değer hesaplama
- **Tam Expertiz**: Kapsamlı araç değerlendirmesi

### 📱 Modern Kullanıcı Arayüzü
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Drag & Drop Upload**: Kolay resim yükleme
- **Real-time Feedback**: Anlık analiz sonuçları
- **Modern UI/UX**: Tailwind CSS + Framer Motion

### 🔐 Güvenlik ve Yönetim
- **JWT Authentication**: Güvenli kullanıcı sistemi
- **Kredi Sistemi**: İşlem bazlı ödeme modeli
- **Profil Yönetimi**: Kullanıcı ayarları ve tercihleri
- **Bildirim Sistemi**: Real-time bildirimler

## 🛠️ Teknoloji Stack

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **Prisma ORM** + **MySQL/PostgreSQL**
- **JWT Authentication**
- **Bcrypt** şifreleme
- **Multer** dosya yükleme

### Frontend
- **Next.js 14** + **React 18** + **TypeScript**
- **Tailwind CSS** + **Framer Motion**
- **Zustand** state management
- **React Hook Form** + **Yup** validasyon
- **Axios** API client

### Database
- **MySQL** (Development)
- **PostgreSQL** (Production)
- **Prisma** ORM

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- MySQL 8.0+
- npm veya yarn

### 1. Repository'yi klonlayın
```bash
git clone https://github.com/unknown1fsh/mivvo.git
cd mivvo
```

### 2. Bağımlılıkları yükleyin
```bash
npm run install:all
```

### 3. Environment variables ayarlayın
```bash
# Backend
cp backend/env.example backend/.env
# .env dosyasını düzenleyin
```

### 4. Veritabanını kurun
```bash
# MySQL'de veritabanı oluşturun
mysql -u root -p
CREATE DATABASE mivvo_expertiz;

# Prisma migration'ını çalıştırın
cd backend
npx prisma generate
npx prisma db push
```

### 5. Uygulamayı başlatın
```bash
# Tüm servisleri başlatın
npm run dev:full

# Veya ayrı ayrı
npm run dev:backend  # Port 3001
npm run dev:frontend # Port 3000
```

## 📱 Kullanım

### Erişim URL'leri
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### Ana Sayfalar
- **Ana Sayfa**: `/` - Landing page
- **Giriş**: `/login` - Kullanıcı girişi
- **Kayıt**: `/register` - Yeni kullanıcı kaydı
- **Dashboard**: `/dashboard` - Ana panel
- **Resim Yükle**: `/vehicle/upload-images` - AI analiz
- **Rapor Oluştur**: `/vehicle/new-report` - Expertiz raporu
- **Ayarlar**: `/settings` - Kullanıcı ayarları
- **Profil**: `/profile` - Profil yönetimi
- **Bildirimler**: `/notifications` - Bildirim merkezi

## 🏗️ Proje Yapısı

```
mivvo/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry point
│   ├── prisma/             # Database schema
│   └── package.json
├── frontend/               # Next.js Frontend
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities & stores
│   └── package.json
├── scripts/                # Development scripts
├── database/               # SQL schemas
└── package.json            # Root package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Çıkış

### User Management
- `GET /api/user/profile` - Profil bilgileri
- `PUT /api/user/profile` - Profil güncelleme
- `GET /api/user/credits` - Kredi bakiyesi

### Vehicle Operations
- `POST /api/vehicle/upload` - Resim yükleme
- `POST /api/vehicle/analyze` - AI analiz
- `GET /api/vehicle/reports` - Raporlar

### Payment
- `POST /api/payment/add-credits` - Kredi yükleme
- `GET /api/payment/transactions` - İşlem geçmişi

## 🎨 UI Components

### Temel Bileşenler
- **Motion Components**: FadeInUp, StaggerContainer
- **UI Components**: Modal, Tabs, Accordion, ProgressBar
- **Form Components**: Validated forms with React Hook Form
- **Loading States**: Spinner ve skeleton loaders

### Tasarım Sistemi
- **Renkler**: Blue-Purple gradient tema
- **Typography**: Modern font stack
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth Framer Motion transitions

## 🔒 Güvenlik

- **JWT Tokens**: Secure authentication
- **Password Hashing**: Bcrypt ile şifreleme
- **Input Validation**: Yup schema validation
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **File Upload Security**: Dosya türü ve boyut kontrolü

## 📊 Database Schema

### Ana Tablolar
- **users**: Kullanıcı bilgileri
- **user_credits**: Kredi bakiyeleri
- **vehicles**: Araç bilgileri
- **vehicle_reports**: Expertiz raporları
- **ai_analysis_results**: AI analiz sonuçları
- **payments**: Ödeme işlemleri

## 🚀 Deployment

### Vercel (Frontend)
```bash
npm run build:frontend
vercel deploy
```

### Railway/Heroku (Backend)
```bash
npm run build:backend
# Railway/Heroku deployment
```

### Environment Variables
```env
# Production
DATABASE_URL="postgresql://..."
JWT_SECRET="your-production-secret"
NODE_ENV="production"
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **GitHub**: [@unknown1fsh](https://github.com/unknown1fsh)
- **Repository**: [mivvo](https://github.com/unknown1fsh/mivvo)

## 🙏 Teşekkürler

- Next.js team
- Tailwind CSS team
- Framer Motion team
- Prisma team
- Tüm açık kaynak katkıda bulunanlar

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!