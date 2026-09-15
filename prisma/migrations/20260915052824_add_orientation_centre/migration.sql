-- CreateTable
CREATE TABLE "orientation_centres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Government Approved (DOFE)',
    "registrationNumber" TEXT DEFAULT '',
    "email" TEXT DEFAULT '',
    "phone" TEXT NOT NULL,
    "alternativePhone" TEXT DEFAULT '',
    "website" TEXT DEFAULT '',
    "address" TEXT NOT NULL,
    "city" TEXT DEFAULT '',
    "district" TEXT DEFAULT '',
    "province" TEXT DEFAULT '',
    "postalCode" TEXT DEFAULT '',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timing" TEXT DEFAULT '',
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "logo" TEXT DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "orientation_centres_pkey" PRIMARY KEY ("id")
);
