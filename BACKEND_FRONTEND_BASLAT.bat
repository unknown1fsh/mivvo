@echo off
echo ========================================
echo MIVVO - Backend ve Frontend Baslat
echo ========================================
echo.

echo [1/2] Backend baslatiliyor...
start "MIVVO Backend" cmd /k "cd /d C:\frontend_projects\mivvo\backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/2] Frontend baslatiliyor...
start "MIVVO Frontend" cmd /k "cd /d C:\frontend_projects\mivvo\frontend && npm run dev"

echo.
echo ========================================
echo Her iki sunucu da baslatildi!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo ========================================
echo.
pause

