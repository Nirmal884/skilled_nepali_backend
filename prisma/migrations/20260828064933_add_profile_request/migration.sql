-- CreateTable
CREATE TABLE "profile_requests" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "jobCategoryId" TEXT NOT NULL,
    "noOfCandidates" INTEGER NOT NULL,
    "status" "AdminApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "profile_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "profile_requests" ADD CONSTRAINT "profile_requests_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_requests" ADD CONSTRAINT "profile_requests_jobCategoryId_fkey" FOREIGN KEY ("jobCategoryId") REFERENCES "job_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
