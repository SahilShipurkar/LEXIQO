/*
  Warnings:

  - Added the required column `updatedAt` to the `test_session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "test_session" ADD COLUMN     "accuracyPercentage" DOUBLE PRECISION,
ADD COLUMN     "attemptedQuestions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "correctAnswers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "testTitle" TEXT,
ADD COLUMN     "totalQuestions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "test_session_userId_status_idx" ON "test_session"("userId", "status");

-- CreateIndex
CREATE INDEX "test_session_testId_idx" ON "test_session"("testId");

-- CreateIndex
CREATE INDEX "test_session_completedAt_idx" ON "test_session"("completedAt");
