/*
  Warnings:

  - A unique constraint covering the columns `[userId,type]` on the table `user_goal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CodingDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "SubmissionVerdict" AS ENUM ('ACCEPTED', 'WRONG_ANSWER', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED', 'COMPILATION_ERROR', 'MEMORY_LIMIT_EXCEEDED', 'PENDING');

-- CreateEnum
CREATE TYPE "ProgrammingLanguage" AS ENUM ('JAVASCRIPT', 'PYTHON', 'JAVA', 'CPP', 'C');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "hasAlphaAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "professionalFocus" TEXT,
ADD COLUMN     "totalXP" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "xp_transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_problem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT NOT NULL,
    "difficulty" "CodingDifficulty" NOT NULL DEFAULT 'EASY',
    "constraints" TEXT,
    "inputFormat" TEXT,
    "outputFormat" TEXT,
    "explanation" TEXT,
    "hints" TEXT[],
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 20,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_problem_tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,

    CONSTRAINT "coding_problem_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_problem_example" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "coding_problem_example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_problem_test_case" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "coding_problem_test_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "starter_code_template" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" "ProgrammingLanguage" NOT NULL,
    "starterCode" TEXT NOT NULL,

    CONSTRAINT "starter_code_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" "ProgrammingLanguage" NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "verdict" "SubmissionVerdict" NOT NULL DEFAULT 'PENDING',
    "runtimeMs" INTEGER,
    "memoryKb" INTEGER,
    "passedCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coding_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_solved_problem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "firstSolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bestRuntimeMs" INTEGER,
    "bestMemoryKb" INTEGER,
    "solvedCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "user_solved_problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_coding_problem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_coding_problem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "xp_transaction_sessionId_key" ON "xp_transaction"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "coding_problem_slug_key" ON "coding_problem"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "coding_problem_tag_name_problemId_key" ON "coding_problem_tag"("name", "problemId");

-- CreateIndex
CREATE UNIQUE INDEX "starter_code_template_problemId_language_key" ON "starter_code_template"("problemId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "user_solved_problem_userId_problemId_key" ON "user_solved_problem"("userId", "problemId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_coding_problem_userId_problemId_key" ON "saved_coding_problem"("userId", "problemId");

-- CreateIndex
CREATE UNIQUE INDEX "user_goal_userId_type_key" ON "user_goal"("userId", "type");

-- AddForeignKey
ALTER TABLE "xp_transaction" ADD CONSTRAINT "xp_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_transaction" ADD CONSTRAINT "xp_transaction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_problem_tag" ADD CONSTRAINT "coding_problem_tag_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "coding_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_problem_example" ADD CONSTRAINT "coding_problem_example_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "coding_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_problem_test_case" ADD CONSTRAINT "coding_problem_test_case_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "coding_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "starter_code_template" ADD CONSTRAINT "starter_code_template_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "coding_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_submission" ADD CONSTRAINT "coding_submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_submission" ADD CONSTRAINT "coding_submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "coding_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_solved_problem" ADD CONSTRAINT "user_solved_problem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_solved_problem" ADD CONSTRAINT "user_solved_problem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "coding_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_coding_problem" ADD CONSTRAINT "saved_coding_problem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_coding_problem" ADD CONSTRAINT "saved_coding_problem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "coding_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
