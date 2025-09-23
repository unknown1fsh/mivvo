/*
  Warnings:

  - The values [ENGINE_SOUND_ANALYSIS] on the enum `ReportType` will be removed. If these variants are still used in the database, this will fail.
  - The values [ENGINE_SOUND_ANALYSIS] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.
  - The values [DEBIT] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `report_id` on the `credit_transactions` table. All the data in the column will be lost.
  - You are about to drop the `paint_analyses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle_audios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vin_lookups` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReportType_new" AS ENUM ('FULL', 'PAINT_ANALYSIS', 'DAMAGE_ASSESSMENT', 'VALUE_ESTIMATION');
ALTER TABLE "vehicle_reports" ALTER COLUMN "report_type" TYPE "ReportType_new" USING ("report_type"::text::"ReportType_new");
ALTER TYPE "ReportType" RENAME TO "ReportType_old";
ALTER TYPE "ReportType_new" RENAME TO "ReportType";
DROP TYPE "ReportType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ServiceType_new" AS ENUM ('PAINT_ANALYSIS', 'DAMAGE_ASSESSMENT', 'VALUE_ESTIMATION', 'FULL_REPORT');
ALTER TABLE "service_pricing" ALTER COLUMN "service_type" TYPE "ServiceType_new" USING ("service_type"::text::"ServiceType_new");
ALTER TYPE "ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "ServiceType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('PURCHASE', 'USAGE', 'REFUND');
ALTER TABLE "credit_transactions" ALTER COLUMN "transaction_type" TYPE "TransactionType_new" USING ("transaction_type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "paint_analyses" DROP CONSTRAINT "paint_analyses_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_audios" DROP CONSTRAINT "vehicle_audios_report_id_fkey";

-- AlterTable
ALTER TABLE "credit_transactions" DROP COLUMN "report_id";

-- DropTable
DROP TABLE "paint_analyses";

-- DropTable
DROP TABLE "vehicle_audios";

-- DropTable
DROP TABLE "vehicles";

-- DropTable
DROP TABLE "vin_lookups";

-- DropEnum
DROP TYPE "AudioType";
