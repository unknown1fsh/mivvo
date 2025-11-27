-- CreateEnum (eğer yoksa)
DO $$ BEGIN
  CREATE TYPE "ReportRefundStatus" AS ENUM ('NONE', 'REFUNDED', 'FAILED', 'PENDING');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateEnum (eğer yoksa)
DO $$ BEGIN
  CREATE TYPE "CreditTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateEnum (eğer yoksa)  
DO $$ BEGIN
  CREATE TYPE "TicketCategory" AS ENUM ('GENERAL', 'TECHNICAL', 'BILLING', 'REPORT_ISSUE', 'FEATURE_REQUEST');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateEnum (eğer yoksa)
DO $$ BEGIN
  CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateEnum (eğer yoksa)
DO $$ BEGIN
  CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable vehicle_reports - Eksik kolonları ekle
ALTER TABLE "vehicle_reports" ADD COLUMN IF NOT EXISTS "failed_reason" TEXT;
ALTER TABLE "vehicle_reports" ADD COLUMN IF NOT EXISTS "credit_transaction_id" INTEGER;
ALTER TABLE "vehicle_reports" ADD COLUMN IF NOT EXISTS "refund_status" "ReportRefundStatus" NOT NULL DEFAULT 'NONE';

-- AlterTable credit_transactions - Eksik kolonları ekle
ALTER TABLE "credit_transactions" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "credit_transactions" ADD COLUMN IF NOT EXISTS "status" "CreditTransactionStatus" NOT NULL DEFAULT 'COMPLETED';
