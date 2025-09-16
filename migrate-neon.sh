#!/bin/bash

echo "🗄️ Mivvo Expertiz - Neon PostgreSQL Migration"
echo "============================================="

# Set environment variables
export DATABASE_URL="postgresql://neondb_owner:npg_JBPa85INZgRd@ep-hidden-queen-adgioweu-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

echo "📦 Installing dependencies..."
cd backend
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️ Pushing database schema to Neon PostgreSQL..."
npx prisma db push

echo "✅ Database migration completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check Neon dashboard for tables"
echo "2. Test Vercel deployment"
echo "3. Verify API endpoints"
echo ""
echo "🎉 Your Mivvo Expertiz app is ready!"
