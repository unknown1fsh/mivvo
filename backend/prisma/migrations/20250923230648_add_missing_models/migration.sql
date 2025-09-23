-- CreateEnum
CREATE TYPE "AudioType" AS ENUM ('ENGINE_SOUND', 'EXHAUST_SOUND', 'MECHANICAL_SOUND');

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
CREATE TABLE "paint_analyses" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "angle" TEXT NOT NULL,
    "image_path" TEXT NOT NULL,
    "image_name" TEXT NOT NULL,
    "analysis_type" TEXT NOT NULL DEFAULT 'paint',
    "paint_condition" TEXT NOT NULL,
    "paint_thickness" INTEGER NOT NULL,
    "color_match" INTEGER NOT NULL,
    "scratches" INTEGER NOT NULL,
    "dents" INTEGER NOT NULL,
    "rust" BOOLEAN NOT NULL DEFAULT false,
    "oxidation" INTEGER NOT NULL,
    "gloss_level" INTEGER NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "recommendations" TEXT[],
    "confidence" INTEGER NOT NULL,
    "technical_details" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paint_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plate" TEXT,
    "vin" TEXT,
    "color" TEXT,
    "mileage" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "vin_lookups_vin_key" ON "vin_lookups"("vin");

-- AddForeignKey
ALTER TABLE "vehicle_audios" ADD CONSTRAINT "vehicle_audios_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "vehicle_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paint_analyses" ADD CONSTRAINT "paint_analyses_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
