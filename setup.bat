@echo off
echo Mivvo Expertiz Projesi Kurulumu Başlatılıyor...
echo.

echo 1. Backend bağımlılıkları yükleniyor...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Backend bağımlılıkları yüklenirken hata oluştu!
    pause
    exit /b 1
)

echo 2. Prisma Client oluşturuluyor...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Prisma Client oluşturulurken hata oluştu!
    pause
    exit /b 1
)

echo 3. Frontend bağımlılıkları yükleniyor...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo Frontend bağımlılıkları yüklenirken hata oluştu!
    pause
    exit /b 1
)

echo 4. Environment dosyaları oluşturuluyor...
cd ../backend
if not exist .env (
    copy env.example .env
    echo Backend .env dosyası oluşturuldu. Lütfen gerekli ayarları yapın.
)

cd ../frontend
if not exist .env.local (
    echo NEXT_PUBLIC_API_URL=http://localhost:3001/api > .env.local
    echo Frontend .env.local dosyası oluşturuldu.
)

echo.
echo ✅ Kurulum tamamlandı!
echo.
echo Başlatmak için:
echo   Backend: cd backend && npm run dev
echo   Frontend: cd frontend && npm run dev
echo.
echo Veritabanı bağlantısını kontrol etmeyi unutmayın!
echo.
pause
