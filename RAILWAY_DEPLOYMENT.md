# Railway Environment Variables Template

## Backend Service Environment Variables

```
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<mevcut-jwt-secret-buraya>
BCRYPT_ROUNDS=10
CORS_ORIGIN=https://mivvo.org,https://www.mivvo.org
OPENAI_API_KEY=<openai-api-key-buraya>
GOOGLE_GEMINI_API_KEY=<google-gemini-api-key-buraya>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<email-adresiniz@gmail.com>
EMAIL_PASS=<email-app-password-buraya>
RECAPTCHA_SECRET_KEY=<recaptcha-secret-key-buraya>
```

## Frontend Service Environment Variables

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=<nextauth-secret-buraya>
NEXTAUTH_URL=https://mivvo.org
GOOGLE_CLIENT_ID=<google-oauth-client-id-buraya>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret-buraya>
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<recaptcha-site-key-buraya>
```

## PostgreSQL Database Service

Railway otomatik olarak PostgreSQL servisi oluşturur ve `DATABASE_URL` environment variable'ını sağlar.

## Deployment Adımları

1. Railway dashboard'da yeni proje oluştur
2. PostgreSQL database ekle
3. Backend servisi oluştur (root directory: `backend`)
4. Frontend servisi oluştur (root directory: `frontend`)
5. Her servise yukarıdaki environment variables'ları ekle
6. GitHub repository'sini bağla
7. Custom domain (mivvo.org) ekle

## Notlar

- `${{Postgres.DATABASE_URL}}` Railway'in otomatik sağladığı database URL'i
- `${{Backend.RAILWAY_PUBLIC_DOMAIN}}` Railway'in otomatik sağladığı backend URL'i
- `<...>` içindeki değerleri kendi değerlerinizle değiştirin
- JWT_SECRET güçlü bir değer olmalı (en az 32 karakter)
- Email için Gmail App Password kullanın
