/*
  Warnings:

  - You are about to drop the column `hints` on the `coding_problem` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `starter_code_template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "coding_problem" DROP COLUMN "hints",
ADD COLUMN     "editorial" TEXT;

-- AlterTable
ALTER TABLE "coding_submission" ADD COLUMN     "output" TEXT;

-- AlterTable
ALTER TABLE "starter_code_template" ADD COLUMN     "fileName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "coding_problem_hint" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "coding_problem_hint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "coding_problem_hint" ADD CONSTRAINT "coding_problem_hint_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "coding_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
