@echo off
echo 🧹 Frontend build cache temizleniyor...

REM Frontend dizinine git
cd frontend

REM Next.js cache temizle
echo 📁 .next klasörü temizleniyor...
if exist .next rmdir /s /q .next

REM Node modules temizle (opsiyonel)
echo 📦 node_modules temizleniyor...
if exist node_modules rmdir /s /q node_modules

REM Package lock dosyasını temizle
echo 🔒 package-lock.json temizleniyor...
if exist package-lock.json del package-lock.json

REM Yeniden install
echo 📥 Dependencies yeniden yükleniyor...
npm install

echo ✅ Frontend cache temizleme tamamlandı!
echo 🚀 Şimdi Railway'e deploy edebilirsiniz.

pause
