-- CreateTable
CREATE TABLE "performance_metric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "testsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTimeMinute" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "performance_metric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "performance_metric_userId_date_key" ON "performance_metric"("userId", "date");

-- AddForeignKey
ALTER TABLE "performance_metric" ADD CONSTRAINT "performance_metric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
