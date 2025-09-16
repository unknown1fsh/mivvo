# Mivvo Expertiz - Neon PostgreSQL Migration Script
# PowerShell version

Write-Host "🗄️ Mivvo Expertiz - Neon PostgreSQL Migration" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Set environment variables
$env:DATABASE_URL = "postgresql://neondb_owner:npg_JBPa85INZgRd@ep-hidden-queen-adgioweu-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install

Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "🗄️ Pushing database schema to Neon PostgreSQL..." -ForegroundColor Yellow
npx prisma db push

Write-Host "✅ Database migration completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check Neon dashboard for tables"
Write-Host "2. Test Vercel deployment"
Write-Host "3. Verify API endpoints"
Write-Host ""
Write-Host "Your Mivvo Expertiz app is ready!" -ForegroundColor Green
