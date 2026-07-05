-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "cell" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "sector" TEXT;

-- AlterTable
ALTER TABLE "referrals" ADD COLUMN     "current_medications" TEXT,
ADD COLUMN     "monitoring_required" TEXT,
ADD COLUMN     "patient_condition" TEXT,
ADD COLUMN     "procedures_received" TEXT,
ADD COLUMN     "significant_findings" TEXT;
