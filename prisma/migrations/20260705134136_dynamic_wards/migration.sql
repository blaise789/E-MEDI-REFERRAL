/*
  Warnings:

  - You are about to drop the column `target_specialist_id` on the `referrals` table. All the data in the column will be lost.
  - You are about to drop the column `target_ward_type` on the `referrals` table. All the data in the column will be lost.
  - You are about to drop the column `discipline` on the `specialists` table. All the data in the column will be lost.
  - You are about to drop the `bed_capacities` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ward_id` to the `specialists` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bed_capacities" DROP CONSTRAINT "bed_capacities_hospital_id_fkey";

-- DropForeignKey
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_target_specialist_id_fkey";

-- AlterTable
ALTER TABLE "referrals" DROP COLUMN "target_specialist_id",
DROP COLUMN "target_ward_type",
ADD COLUMN     "target_ward_name" TEXT;

-- AlterTable
ALTER TABLE "specialists" DROP COLUMN "discipline",
ADD COLUMN     "shift_end_time" TEXT,
ADD COLUMN     "shift_start_time" TEXT,
ADD COLUMN     "ward_id" TEXT NOT NULL,
ADD COLUMN     "working_days" TEXT[];

-- DropTable
DROP TABLE "bed_capacities";

-- DropEnum
DROP TYPE "SpecialistDiscipline";

-- DropEnum
DROP TYPE "WardType";

-- CreateTable
CREATE TABLE "wards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_beds" INTEGER NOT NULL,
    "occupied_beds" INTEGER NOT NULL DEFAULT 0,
    "hospital_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wards_hospital_id_name_key" ON "wards"("hospital_id", "name");

-- AddForeignKey
ALTER TABLE "wards" ADD CONSTRAINT "wards_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialists" ADD CONSTRAINT "specialists_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
