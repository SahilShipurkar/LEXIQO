-- AlterTable
ALTER TABLE "user" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastCompletedDate" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0;
