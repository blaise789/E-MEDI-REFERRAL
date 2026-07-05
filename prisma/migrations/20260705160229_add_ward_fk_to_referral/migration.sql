-- AlterTable
ALTER TABLE "referrals" ADD COLUMN     "ward_id" TEXT;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
