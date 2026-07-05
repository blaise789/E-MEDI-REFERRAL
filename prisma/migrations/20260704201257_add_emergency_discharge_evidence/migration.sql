-- AlterTable
ALTER TABLE "counter_referrals" ADD COLUMN     "evidence_url" TEXT,
ALTER COLUMN "discharge_notes" DROP NOT NULL,
ALTER COLUMN "follow_up_instructions" DROP NOT NULL;

-- AlterTable
ALTER TABLE "referrals" ADD COLUMN     "is_emergency" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejection_reason" TEXT;
