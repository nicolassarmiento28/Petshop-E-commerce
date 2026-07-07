-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "changeReason" TEXT,
ADD COLUMN     "changedByAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rescheduledFrom" TIMESTAMP(3),
ADD COLUMN     "rescheduledFromTime" TEXT;
