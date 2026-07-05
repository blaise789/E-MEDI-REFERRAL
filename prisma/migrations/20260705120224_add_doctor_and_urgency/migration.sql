-- CreateEnum
CREATE TYPE "ReferralUrgency" AS ENUM ('ROUTINE', 'URGENT', 'EMERGENCY');

-- AlterTable
ALTER TABLE "referrals" ADD COLUMN     "referring_doctor_contact" TEXT,
ADD COLUMN     "referring_doctor_name" TEXT,
ADD COLUMN     "urgency" "ReferralUrgency" NOT NULL DEFAULT 'ROUTINE';
