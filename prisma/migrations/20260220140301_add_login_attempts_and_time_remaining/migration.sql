-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "loginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timeRemaining" INTEGER NOT NULL DEFAULT -1;
