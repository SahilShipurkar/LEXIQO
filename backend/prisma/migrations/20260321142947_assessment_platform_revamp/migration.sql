/*
  Warnings:

  - You are about to drop the column `lastCompletedDate` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `di_question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dsa_question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `logical_question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quantitative_question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `test_result` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verbal_question` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABORTED');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ON_TRACK', 'BEHIND', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "test_result" DROP CONSTRAINT "test_result_userId_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "lastCompletedDate",
ADD COLUMN     "lastActivityDate" TIMESTAMP(3),
ADD COLUMN     "totalPoints" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "di_question";

-- DropTable
DROP TABLE "dsa_question";

-- DropTable
DROP TABLE "logical_question";

-- DropTable
DROP TABLE "quantitative_question";

-- DropTable
DROP TABLE "test_result";

-- DropTable
DROP TABLE "verbal_question";

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_test" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "duration" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "tags" TEXT[],
    "status" "TestStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "testId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" DOUBLE PRECISION,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "test_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_response" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "GoalType" NOT NULL DEFAULT 'DAILY',
    "targetValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "status" "GoalStatus" NOT NULL DEFAULT 'ON_TRACK',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "appearanceMode" TEXT NOT NULL DEFAULT 'system',
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "preferredCategories" TEXT[],
    "defaultTestBehavior" TEXT,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- AddForeignKey
ALTER TABLE "practice_test" ADD CONSTRAINT "practice_test_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_testId_fkey" FOREIGN KEY ("testId") REFERENCES "practice_test"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_session" ADD CONSTRAINT "test_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_session" ADD CONSTRAINT "test_session_testId_fkey" FOREIGN KEY ("testId") REFERENCES "practice_test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_response" ADD CONSTRAINT "user_response_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_response" ADD CONSTRAINT "user_response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_goal" ADD CONSTRAINT "user_goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
