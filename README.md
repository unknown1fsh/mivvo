# Mivvo Expertiz

Yapay zeka destekli araç expertiz platformumuz; backend ve frontend’in aynı depo içinde koordine olduğu bir monorepo düzeninde çalışır. Gerçek AI modelleriyle boyadan hasara, motor sesi analizinden kapsamlı ekspertiz raporlamaya kadar geniş bir yelpazede hizmet veriyoruz.

## İçindekiler
- [Hızlı Başlangıç](#h%C4%B1zl%C4%B1-ba%C5%9Flang%C4%B1%C3%A7)
- [Monorepo Yerleşimi](#monorepo-yerle%C5%9Fimi)
- [Backend Mimarisi](#backend-mimarisi)
- [Frontend Mimarisi](#frontend-mimarisi)
- [Operasyonel Notlar](#operasyonel-notlar)
- [AI Davranış Kuralları](#ai-davran%C4%B1%C5%9F-kurallar%C4%B1)

## Hızlı Başlangıç

### Önkoşullar
- Node.js `>=18` ve npm `>=8` (kök `package.json` [`engines`](package.json#L56) bölümüyle uyumlu).
- `UPLOAD_PATH`, `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY` gibi kritik değişkenleri backend `env.example` ve kök `env.local.example` dosyalarından kopyalayarak sağlayın.

### Ortam kurulumu
1. `npm run install:all` → hem front hem backend bağımlılıklarını yükler (kök [`package.json`](package.json#L21-L40)).
2. `npm run setup:db` (veya `node scripts/setup-database.js`) → test/yerel veritabanı hazırlığı, Prisma migrate/generate öncesi veri ve kullanıcı bilgileri.
3. Backend için `.env`, frontend için `.env.local` dosyalarını oluşturun ve `backend/env.example`, `env.local.example` içeriğini temel alın.

### Geliştirme komutları
- `npm run dev` → [`scripts/dev-full.js`](scripts/dev-full.js) ile backend/ frontend paralel çalışır; eğer bağımlılıklar eksikse yükler, Prisma Client ve DB bağlantısını kontrol eder.
- `npm run dev:backend`, `npm run dev:frontend` → ilgili dizinlerde Next.js/Express’e özel başlatma.
- `npm run build`: önce backend (`npm run build:backend`), sonra frontend (`npm run build:frontend`) üretir.
- `npm run test`: backend testleri (`jest`) ve frontend testleri (Next.js test runner) birlikte çalışır.
- `npm run lint`, `npm run lint:backend`, `npm run lint:frontend` → ESLint kuralları.
- `npm run start:full` / `npm run start:railway` / `npm run start:backend` / `npm run start:frontend` → üretim ortamına özel başlatmalar.

## Monorepo Yerleşimi

- `backend/`: Express tabanlı API, Prisma schema, AI servisleri, BullMQ kuyrukları, job’lar ve veritabanı scriptleri yer alır.
- `frontend/`: Next.js 14 App Router, Tailwind ile stil, NextAuth tabanlı kimlik doğrulama, özel hook ve servis katmanları.
- `scripts/`: `dev-full`, `start-full`, `view-logs`, `export-local-to-neon` gibi proje yaşam döngüsünü destekleyen yardımcı script’ler.
- `Dockerfile`: production / CI ortamları için tek adımda dependency yüklemesi, Prisma generate ve tam build süreci (`Dockerfile`).
- `env.local.example` + `backend/env.example`: hem frontend hem backend için minimum ortam değişkenleri.
- `uploads/`: ses/görüntü dosyaları, analiz çıktı dosyaları ve AI modellerinin çıktıları burada saklanır.
- `models/`: AI analizinde kullanılan TensorFlow / OpenAI modelleri (`damage-detection`, `paint-analysis`, `audio-analysis` klasörleri).

## Backend Mimarisi

### Giriş akışı
- `backend/src/index.ts` → environment doğrulaması (`validateEnv`), Sentry başlatma, diğer middleware’ler, route’ların kaydı, upload servisi ve queue worker başlatmaları burada toplanır.
- API prefix’leri `/api/auth`, `/api/vehicle`, `/api/ai-analysis`, `/api/damage-analysis`, `/api/paint-analysis` gibi modüler route dosyaları üzerinden birbirinden ayrılır.
- `requestLogger`, `databaseLoggerMiddleware`, `errorHandler`, `notFound` gibi genel middleware’ler pipeline içinde yer alır.

### Katmanlar
- **Routes → Controllers → Services** (Clean Architecture): Route dosyaları (`backend/src/routes/…`) controller’lara, controller’lar service’lere delegasyon yapar. Örneğin `aiAnalysis` route’u `aiAnalysisController` → `AIService`.
- **Services**: `AIService` (Facade), `ModernDamageAnalysisService`, `PaintAnalysisService`, `AudioAnalysisService` gibi gerçek AI entegrasyonları; `storageService` S3/ucu açık depolama; `paymentService` ve `emailService` dış servisleri sarar; `queueService` BullMQ ile job yönetimini sağlıyor (`backend/src/services/queueService.ts`).
- **Jobs**: `AI_ANALYSIS_QUEUE` (damage, paint, engine sound) gibi tanımlı kuyruklar `backend/src/jobs/aiAnalysisJob.ts` ve `emailJob.ts` ile worker olarak çalışır.
- **Middleware**: JWT doğrulama, rol tabanlı yetki (`authenticate`, `authorize`, `optionalAuth`) `backend/src/middleware/auth.ts`, dosya/audio doğrulamaları (`imageValidation`, `audioValidation`), Sentry/monitoring, error handling (async handler) burada yer alır.
- **Veri modelleri**: Prisma schema `backend/prisma/schema.prisma` içinde kullanıcı, rapor, analiz, finans, bildirim, destek bileşenleri tanımlıdır; AI sonuçları `aiAnalysisResults`, `vehicleReports`, `vehicleImages` vb. ile ilişkilenir.
- **Environment & Observability**: `envValidation.ts` (zod ile doğrulama, Railway için özel mesajlar), `monitoring.ts` (health metrics), `sentry.ts` (profiling + beforeSend filtreleri) ve request logları monitored bir yapı sunar.

### AI & Gerçek modeller
- `AIService` gerçek OpenAI / TensorFlow modellerini kullanır, hata durumunda fallback yok; hatalar controller’dan yakalanıp kullanıcılara anlamlı mesajla iletilir (`backend/src/services/aiService.ts`).
- `backend/package.json` içinde `@tensorflow/tfjs`, `@google/generative-ai`, `@sentry/node`, `sharp`, `bullmq`, `@aws-sdk/client-s3`, `openai`, `@tensorflow/tfjs-node` gibi bağımlılıklar AI hattını güçlendirir (`backend/package.json`).
- Kuyruk tabanlı iş akışında job kuyruğa ekleniyor, worker Prisma ile rapor durumunu güncelliyor ve `aiAnalysisResult` tablosuna yazıyor (`backend/src/jobs/aiAnalysisJob.ts`).

### Dış servisler & Depolama
- `storageService` ve `uploads/` sayesinde görseller, audio ve rapor PDF’leri geçici veya kalıcı alanlara yazılır.
- SMTP/iyzico/Redis değişkenleri `backend/env.example` üzerinden şablonlanır.

## Frontend Mimarisi

### App Router + Layout
- `frontend/app/layout.tsx` → Inter + Poppins fontları, `Providers` (NextAuth `SessionProvider`), `react-hot-toast` konfigürasyonu ve genel `<body>` stili.
- `frontend/app/page.tsx` → Framer Motion destekli navigation, hero, hizmet kartları ve istatistik panelleri; kullanıcıya modern landing page deneyimi sunar.

### Bileşenler
- `components/features/` içinde ses kaydı, boya/hasar raporları, dosya yükleme, rehberler, rapor özetleri gibi domain spesifik bileşenler var.
- `components/ui/` altındaki `Button`, `Card`, `AnimatedCard`, `LoadingComponents`, `ReportError` gibi yeniden kullanılabilir Tailwind + `class-variance-authority` bileşenleri, dijital tasarım sistemini oluşturur.
- `components/admin/` altındaki grafik, tablo, modal bileşenleri altyapı yöneticileri için özel dashboard’lar sunar.
- `ErrorBoundary` ve özel motion bileşenleri kullanıcı deneyimini iyileştirir.

### Veri katmanı ve hook’lar
- `services/apiClient.ts` → `fetch` tabanlı merkezi HTTP client, token injection, timeout, FormData desteği, retry mantığı ve loglama (`logger.apiRequest` vb.). Backend API URL’ini `NEXT_PUBLIC_API_URL` veya development’ta localhost’tan çözer.
- `services/*` klasöründe `vehicleGarageService`, `damageAnalysisService`, `authService`, `emailService` gibi endpoint kapsayıcıları bulunur.
- `hooks/` → `useAuth`, `useDamageAnalysis`, `usePaintAnalysis`, `useAudioRecording`, `useReportPolling`, `useComprehensiveExpertise` gibi domain-specific hook’lar, state + effect yönetimini modülerleştirir.
- `lib/logger.ts` → komponent lifecycle, API request/response, state değişimi ve performans ölçümleri için konsolda renkli loglar üretir.

### Authentication & Middleware
- `frontend/app/api/auth/[...nextauth]/route.ts` NextAuth ile credentials provider, JWT, session callback’leri ve OAuth provider tanımı içerir.
- `frontend/app/api/health/route.ts` → Railway/monitoring tarafına health check endpoint’i sunar.
- `frontend/middleware.ts` → `/admin` altındaki sayfaları basit JWT kontrolü ile korur, cookie’deki `admin_token` içeriğini doğrular.

### Stil & Halk
- Tailwind konfigurasyonu `frontend/tailwind.config.js` + `frontend/postcss.config.js`.
- Global stiller `frontend/app/globals.css`.
- `public/` içinde favicon ve statik varlıklar var.

## Operasyonel Notlar

### Veri & Veritabanı
- Prisma client `backend/prisma/schema.prisma`, migration’lar `backend/prisma/migrations/` içinde tutulur; `npx prisma migrate dev`, `prisma migrate deploy`, `prisma studio` (via `npm run db:studio`), `prisma generate` (build sırasında) komutları kullanılır.
- `backend/scripts/` klasörü `setup-test-database.js`, `create-test-database.js`, `export-local-to-neon.js` gibi yardımcı script’leri barındırır.

### Kuyruk & Background
- `bullmq` ve `ioredis` ile kuyruk host edilir (`backend/src/services/queueService.ts`), lazer gibi 5 concurrency + limiter.
- `AIAnalysisJob` ve `EmailJob` worker’ları app startup’ta başlatılır; production’da Redis yoksa worker’lar devre dışı kalır.

### Dağıtım ve konteyner
- `Dockerfile` → Alpine Node tabanlı, önce `npm install`, sonra Prisma generate, `npm run build`, 3000 port, `NODE_ENV=production`.
- Railway workflow için `railway.json` (frontend/backend) ve `railway_backup.json`.
- Frontend deploy için `NEXT_PUBLIC_API_URL`, backend için `RAILWAY_*` env’leri.

### Gözlem & Log
- `backend/src/utils/monitoring.ts` ile response süresi istatistikleri toplanır; `/api/metrics` endpoint’i bunları verir.
- Sentry, üretimde `SENTRY_DSN` ile `initSentry()` üzerinden başlatılır, hata filtreleri ve profil entegre edilir.
- Winston + request logging + rate limit, CORS + helmet/compression/en güçlü production layer `backend/src/index.ts` içinde tanımlanır.

## AI Davranış Kuralları

1. **Bu README’yi referans alın.** Her yeni kullanıcı isteği veya kod değişikliği talebinin başında bu dosyanın ilgili bölümünü tekrar okuyun; `AI Davranış Kuralları` kendinizi yönlendiren temel belgedir.
2. **Talep geldiğinde “Hangi katman/alan?” sorusu sorulsun.** Önce backend mi frontend mi AI mi, hangi hizmet, hangi dosya? Bu README içindeki “Backend Mimarisi” / “Frontend Mimarisi” başlıkları size yol gösterir.
3. **Kurulum/komutlar için yanlış komutu çalıştırmayın.** Eğer komut verirken garantisi yoksa önce “Hangi klasör?” sorun ve `Hızlı Başlangıç` bölümünü teyit edin.
4. **Yapay zeka iş akışında gerçek modelleri dikkate alın.** Hasar/damage, boya/paint, motor sesi/engine sound analizlerinde `backend/src/services/aiService.ts` + `jobs/aiAnalysisJob.ts` yolunu takip edin; sahte veri değil gerçek AI modeli varsayımıyla işlem yapın.
5. **Kullanıcı “AI’ye özel rehber” dediğinde doğrudan bu bölümdeki adımları kapsayan cevap verin.**

Bu README, alias “Mivvo AI Rehberi”dir. Yeni bir açıklama, düzeltme veya özellik önerisinde bulunmadan önce bu dosyanın ilgili kısmını tekrar kontrol etmek sizin görev tanımınızın bir parçasıdır.

