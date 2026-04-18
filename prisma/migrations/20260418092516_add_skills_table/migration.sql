-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserSkills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserSkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "skills_skillName_key" ON "skills"("skillName");

-- CreateIndex
CREATE INDEX "_UserSkills_B_index" ON "_UserSkills"("B");

-- AddForeignKey
ALTER TABLE "_UserSkills" ADD CONSTRAINT "_UserSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserSkills" ADD CONSTRAINT "_UserSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
