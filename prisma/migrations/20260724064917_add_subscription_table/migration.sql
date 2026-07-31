-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('CREATED', 'AUTHENTICATED', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('MONTHLY_ELITE', 'MONTHLY_PLATINUM', 'YEARLY_ELITE', 'YEARLY_PLATINUM');

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpaySubId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL,
    "status" "PlanStatus" NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "currentCycleStart" TIMESTAMP(3),
    "currentCycleEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_razorpaySubId_key" ON "subscriptions"("razorpaySubId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
