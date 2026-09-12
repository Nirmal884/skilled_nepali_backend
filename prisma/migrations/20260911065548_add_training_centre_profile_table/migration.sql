-- CreateTable
CREATE TABLE "training_centre_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "centreName" TEXT DEFAULT '',
    "tagline" TEXT DEFAULT '',
    "centreType" TEXT DEFAULT 'VOCATIONAL_TECHNICAL',
    "registrationNumber" TEXT DEFAULT '',
    "affiliationNumber" TEXT DEFAULT '',
    "establishedYear" INTEGER,
    "contactPerson" TEXT DEFAULT '',
    "contactDesignation" TEXT DEFAULT '',
    "primaryPhone" TEXT DEFAULT '',
    "alternativePhone" TEXT DEFAULT '',
    "officialEmail" TEXT DEFAULT '',
    "website" TEXT DEFAULT '',
    "facebookUrl" TEXT DEFAULT '',
    "linkedinUrl" TEXT DEFAULT '',
    "youtubeUrl" TEXT DEFAULT '',
    "address" TEXT DEFAULT '',
    "city" TEXT DEFAULT '',
    "district" TEXT DEFAULT '',
    "province" TEXT DEFAULT '',
    "postalCode" TEXT DEFAULT '',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "about" TEXT DEFAULT '',
    "facilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "operatingHours" TEXT DEFAULT '',
    "centreLogo" TEXT DEFAULT '',
    "coverImage" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_centre_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_centre_profiles_userId_key" ON "training_centre_profiles"("userId");

-- AddForeignKey
ALTER TABLE "training_centre_profiles" ADD CONSTRAINT "training_centre_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
