-- DropTable
DROP TABLE IF EXISTS "paint_analyses";

-- DropTable
DROP TABLE IF EXISTS "vehicles";

-- AlterEnum
-- Remove DAMAGE_ASSESSMENT from ReportType (if exists)
-- This was already applied via db push

-- AlterEnum
ALTER TYPE "ServiceType" ADD VALUE IF NOT EXISTS 'COMPREHENSIVE_EXPERTISE';

-- Note: Vehicle and PaintAnalysis tables removed as they were not being used
-- The application now uses VehicleGarage and VehicleReport with AiAnalysisResult instead

