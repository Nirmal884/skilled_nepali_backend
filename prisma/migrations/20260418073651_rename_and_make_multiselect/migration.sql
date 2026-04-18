/*
  Warnings:

  - You are about to drop the column `jobCategoryId` on the `user_profiles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_jobCategoryId_fkey";

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "jobCategoryId";

-- CreateTable
CREATE TABLE "_UserJobCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserJobCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserJobCategories_B_index" ON "_UserJobCategories"("B");

-- AddForeignKey
ALTER TABLE "_UserJobCategories" ADD CONSTRAINT "_UserJobCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "job_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserJobCategories" ADD CONSTRAINT "_UserJobCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
