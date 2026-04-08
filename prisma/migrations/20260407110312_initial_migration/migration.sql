-- CreateEnum
CREATE TYPE "Role" AS ENUM ('JOBSEEKER', 'EMPLOYER', 'TRAINING_CENTRE');

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "country" INTEGER NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'JOBSEEKER',
    "jobCategoryId" TEXT,
    "applicantTypeId" TEXT,
    "experience" DOUBLE PRECISION,
    "pastExperience" TEXT,
    "resume" TEXT,
    "companyName" TEXT,
    "designation" TEXT,
    "companyLogo" TEXT,
    "centreName" TEXT,
    "centreLogo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_categories" (
    "id" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "job_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicant_types" (
    "id" TEXT NOT NULL,
    "applicantTypeName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "applicant_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "job_categories_categoryName_key" ON "job_categories"("categoryName");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_types_applicantTypeName_key" ON "applicant_types"("applicantTypeName");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_jobCategoryId_fkey" FOREIGN KEY ("jobCategoryId") REFERENCES "job_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_applicantTypeId_fkey" FOREIGN KEY ("applicantTypeId") REFERENCES "applicant_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
