-- AlterTable
ALTER TABLE "referrals" ADD COLUMN     "assigned_specialist_id" TEXT;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_assigned_specialist_id_fkey" FOREIGN KEY ("assigned_specialist_id") REFERENCES "specialists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
