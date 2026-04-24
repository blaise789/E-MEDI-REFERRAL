-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLINICIAN', 'FOCAL_PERSON', 'HOSPITAL_ADMIN', 'SYS_ADMIN');

-- CreateEnum
CREATE TYPE "HospitalLevel" AS ENUM ('DISTRICT', 'REFERRAL');

-- CreateEnum
CREATE TYPE "WardType" AS ENUM ('GENERAL_MEDICAL', 'SURGICAL', 'ICU', 'HDU', 'MATERNITY', 'PEDIATRIC');

-- CreateEnum
CREATE TYPE "SpecialistDiscipline" AS ENUM ('GENERAL_SURGERY', 'ORTHOPEDIC_SURGERY', 'OBSTETRICS_GYNECOLOGY', 'INTERNAL_MEDICINE', 'PEDIATRICS', 'NEUROLOGY', 'ANESTHESIA', 'INTENSIVE_CARE');

-- CreateEnum
CREATE TYPE "SpecialistStatus" AS ENUM ('AVAILABLE', 'IN_THEATRE', 'ON_CALL', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "ReferralUrgency" AS ENUM ('ROUTINE', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'REJECTED', 'IN_TRANSIT', 'ADMITTED', 'DISCHARGED', 'COUNTER_REFERRED');

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "HospitalLevel" NOT NULL,
    "location" TEXT NOT NULL,
    "contact_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLINICIAN',
    "telephone" TEXT,
    "hospital_id" TEXT,
    "profile_picture_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bed_capacities" (
    "id" TEXT NOT NULL,
    "ward_type" "WardType" NOT NULL,
    "total_beds" INTEGER NOT NULL,
    "occupied_beds" INTEGER NOT NULL DEFAULT 0,
    "hospital_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bed_capacities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialists" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "discipline" "SpecialistDiscipline" NOT NULL,
    "status" "SpecialistStatus" NOT NULL DEFAULT 'UNAVAILABLE',
    "hospital_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "national_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "insurance" TEXT,
    "contact_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "referring_hospital_id" TEXT NOT NULL,
    "receiving_hospital_id" TEXT NOT NULL,
    "initiated_by_id" TEXT NOT NULL,
    "urgency" "ReferralUrgency" NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reason_for_transfer" TEXT NOT NULL,
    "target_ward_type" "WardType",
    "target_specialist_id" TEXT,
    "diagnosis" TEXT NOT NULL,
    "pre_transfer_treatment" TEXT,
    "transport_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counter_referrals" (
    "id" TEXT NOT NULL,
    "referral_id" TEXT NOT NULL,
    "discharge_notes" TEXT NOT NULL,
    "follow_up_instructions" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counter_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "recipient_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entity_id" TEXT,
    "details" TEXT,
    "performed_by_id" TEXT,
    "referral_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_name_key" ON "hospitals"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bed_capacities_hospital_id_ward_type_key" ON "bed_capacities"("hospital_id", "ward_type");

-- CreateIndex
CREATE UNIQUE INDEX "patients_national_id_key" ON "patients"("national_id");

-- CreateIndex
CREATE UNIQUE INDEX "counter_referrals_referral_id_key" ON "counter_referrals"("referral_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profile_picture_id_fkey" FOREIGN KEY ("profile_picture_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bed_capacities" ADD CONSTRAINT "bed_capacities_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialists" ADD CONSTRAINT "specialists_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referring_hospital_id_fkey" FOREIGN KEY ("referring_hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_receiving_hospital_id_fkey" FOREIGN KEY ("receiving_hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_initiated_by_id_fkey" FOREIGN KEY ("initiated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_target_specialist_id_fkey" FOREIGN KEY ("target_specialist_id") REFERENCES "specialists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_referrals" ADD CONSTRAINT "counter_referrals_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
