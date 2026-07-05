-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "referral_id" TEXT;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
