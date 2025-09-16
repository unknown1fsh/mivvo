#!/bin/bash

echo "🗄️ Mivvo Expertiz - Database Migration Script"
echo "============================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set!"
    echo "Please set it to your Neon PostgreSQL connection string"
    exit 1
fi

echo "📦 Installing dependencies..."
cd backend
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️ Pushing database schema..."
npx prisma db push

echo "✅ Database migration completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test your application"
echo "2. Check database connection"
echo "3. Verify all tables are created"
echo ""
echo "🎉 Your Mivvo Expertiz app is ready!"
