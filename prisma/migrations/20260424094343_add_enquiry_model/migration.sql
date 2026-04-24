-- CreateEnum
CREATE TYPE "MessageSubject" AS ENUM ('JOBINQUIRY', 'EMPLOYERPARTNERSHIP', 'TRAININGINQUIRY', 'GENERALINQUIRY');

-- CreateTable
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "subject" "MessageSubject" NOT NULL,
    "enquiry" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);
