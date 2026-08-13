-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "durationHours" TEXT,
    "level" TEXT NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "price" TEXT,
    "seats" INTEGER NOT NULL,
    "seatsLeft" INTEGER NOT NULL,
    "isCertified" BOOLEAN NOT NULL DEFAULT false,
    "certBody" TEXT,
    "topics" TEXT[],
    "mode" TEXT NOT NULL DEFAULT 'ONLINE',
    "language" TEXT,
    "image" TEXT,
    "videoUrl" TEXT,
    "trainer" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "jobCategoryId" TEXT NOT NULL,
    "trainingCentreId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_jobCategoryId_fkey" FOREIGN KEY ("jobCategoryId") REFERENCES "job_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_trainingCentreId_fkey" FOREIGN KEY ("trainingCentreId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
