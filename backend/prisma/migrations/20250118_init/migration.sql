-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'EXPERT');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'USAGE', 'REFUND');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('FULL_REPORT', 'PAINT_ANALYSIS', 'DAMAGE_ANALYSIS', 'DAMAGE_ASSESSMENT', 'VALUE_ESTIMATION', 'ENGINE_SOUND_ANALYSIS', 'COMPREHENSIVE_EXPERTISE');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('EXTERIOR', 'INTERIOR', 'ENGINE', 'DAMAGE', 'PAINT');

-- CreateEnum
CREATE TYPE "AudioType" AS ENUM ('ENGINE_SOUND', 'EXHAUST_SOUND', 'MECHANICAL_SOUND');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('PAINT_ANALYSIS', 'DAMAGE_ASSESSMENT', 'DAMAGE_ANALYSIS', 'VALUE_ESTIMATION', 'FULL_REPORT', 'ENGINE_SOUND_ANALYSIS', 'COMPREHENSIVE_EXPERTISE');

-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_credits" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_purchased" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_used" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_reports" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "vehicle_garage_id" INTEGER,
    "vehicle_plate" TEXT,
    "vehicle_brand" TEXT,
    "vehicle_model" TEXT,
    "vehicle_year" INTEGER,
    "vehicle_color" TEXT,
    "mileage" INTEGER,
    "report_type" "ReportType" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "ai_analysis_data" JSONB,
    "expert_notes" TEXT,
    "total_cost" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_images" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_type" "ImageType" NOT NULL,
    "file_size" INTEGER,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ai_processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "vehicle_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_audios" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "audio_path" TEXT NOT NULL,
    "audio_name" TEXT NOT NULL,
    "audio_type" "AudioType" NOT NULL,
    "file_size" INTEGER,
    "duration" INTEGER,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ai_processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "vehicle_audios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analysis_results" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "analysis_type" TEXT NOT NULL,
    "confidence_score" DECIMAL(65,30),
    "result_data" JSONB NOT NULL,
    "processing_time_ms" INTEGER,
    "model_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_pricing" (
    "id" SERIAL NOT NULL,
    "service_name" TEXT NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "base_price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" SERIAL NOT NULL,
    "setting_key" TEXT NOT NULL,
    "setting_value" TEXT,
    "setting_type" "SettingType" NOT NULL DEFAULT 'STRING',
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_provider" TEXT,
    "transaction_id" TEXT,
    "reference_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vin_lookups" (
    "id" SERIAL NOT NULL,
    "vin" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "model_year" TEXT,
    "manufacturer" TEXT,
    "plant_country" TEXT,
    "vehicle_type" TEXT,
    "body_class" TEXT,
    "engine_cylinders" TEXT,
    "engine_displacement" TEXT,
    "fuel_type" TEXT,
    "transmission_style" TEXT,
    "drive_type" TEXT,
    "trim" TEXT,
    "series" TEXT,
    "doors" TEXT,
    "windows" TEXT,
    "wheel_base" TEXT,
    "gvwr" TEXT,
    "plant_city" TEXT,
    "plant_state" TEXT,
    "plant_company_name" TEXT,
    "error_code" TEXT,
    "error_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vin_lookups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_garage" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plate" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT,
    "mileage" INTEGER,
    "vin" TEXT,
    "fuel_type" TEXT,
    "transmission" TEXT,
    "engine_size" TEXT,
    "body_type" TEXT,
    "doors" INTEGER,
    "seats" INTEGER,
    "notes" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_garage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_garage_images" (
    "id" SERIAL NOT NULL,
    "vehicle_garage_id" INTEGER NOT NULL,
    "image_path" TEXT NOT NULL,
    "image_name" TEXT NOT NULL,
    "image_type" "ImageType" NOT NULL,
    "file_size" INTEGER,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_garage_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_credits_user_id_key" ON "user_credits"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_setting_key_key" ON "system_settings"("setting_key");

-- CreateIndex
CREATE UNIQUE INDEX "vin_lookups_vin_key" ON "vin_lookups"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_garage_plate_key" ON "vehicle_garage"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_garage_vin_key" ON "vehicle_garage"("vin");

-- AddForeignKey
ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_reports" ADD CONSTRAINT "vehicle_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_reports" ADD CONSTRAINT "vehicle_reports_vehicle_garage_id_fkey" FOREIGN KEY ("vehicle_garage_id") REFERENCES "vehicle_garage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_images" ADD CONSTRAINT "vehicle_images_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "vehicle_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_audios" ADD CONSTRAINT "vehicle_audios_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "vehicle_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analysis_results" ADD CONSTRAINT "ai_analysis_results_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "vehicle_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_garage" ADD CONSTRAINT "vehicle_garage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_garage_images" ADD CONSTRAINT "vehicle_garage_images_vehicle_garage_id_fkey" FOREIGN KEY ("vehicle_garage_id") REFERENCES "vehicle_garage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
