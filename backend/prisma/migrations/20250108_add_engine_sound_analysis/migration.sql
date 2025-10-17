-- CreateEnum (ServiceType doesn't exist, so create it first)
CREATE TYPE "ServiceType" AS ENUM ('PAINT_ANALYSIS', 'DAMAGE_ASSESSMENT', 'VALUE_ESTIMATION', 'FULL_REPORT', 'ENGINE_SOUND_ANALYSIS');

-- CreateTable
CREATE TABLE "service_pricing" (
    "id" SERIAL NOT NULL,
    "service_name" TEXT NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_pricing_pkey" PRIMARY KEY ("id")
);

