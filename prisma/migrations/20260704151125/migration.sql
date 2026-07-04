/*
  Warnings:

  - The values [ACCEPTED,REJECTED,IN_TRANSIT] on the enum `ReferralStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [IN_THEATRE,ON_CALL] on the enum `SpecialistStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `urgency` on the `referrals` table. All the data in the column will be lost.
  - Made the column `national_id` on table `patients` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReferralStatus_new" AS ENUM ('SUBMITTED', 'ADMITTED', 'DISCHARGED', 'COUNTER_REFERRED');
ALTER TABLE "public"."referrals" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "referrals" ALTER COLUMN "status" TYPE "ReferralStatus_new" USING ("status"::text::"ReferralStatus_new");
ALTER TYPE "ReferralStatus" RENAME TO "ReferralStatus_old";
ALTER TYPE "ReferralStatus_new" RENAME TO "ReferralStatus";
DROP TYPE "public"."ReferralStatus_old";
ALTER TABLE "referrals" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SpecialistStatus_new" AS ENUM ('AVAILABLE', 'UNAVAILABLE');
ALTER TABLE "public"."specialists" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "specialists" ALTER COLUMN "status" TYPE "SpecialistStatus_new" USING ("status"::text::"SpecialistStatus_new");
ALTER TYPE "SpecialistStatus" RENAME TO "SpecialistStatus_old";
ALTER TYPE "SpecialistStatus_new" RENAME TO "SpecialistStatus";
DROP TYPE "public"."SpecialistStatus_old";
ALTER TABLE "specialists" ALTER COLUMN "status" SET DEFAULT 'UNAVAILABLE';
COMMIT;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "email" TEXT,
ADD COLUMN     "hospital_id" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "national_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "referrals" DROP COLUMN "urgency";

-- DropEnum
DROP TYPE "ReferralUrgency";

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
