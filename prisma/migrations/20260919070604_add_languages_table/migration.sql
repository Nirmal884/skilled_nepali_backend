-- CreateTable
CREATE TABLE "languages" (
    "id" TEXT NOT NULL,
    "languageName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserLanguages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserLanguages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "languages_languageName_key" ON "languages"("languageName");

-- CreateIndex
CREATE INDEX "_UserLanguages_B_index" ON "_UserLanguages"("B");

-- AddForeignKey
ALTER TABLE "_UserLanguages" ADD CONSTRAINT "_UserLanguages_A_fkey" FOREIGN KEY ("A") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserLanguages" ADD CONSTRAINT "_UserLanguages_B_fkey" FOREIGN KEY ("B") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
