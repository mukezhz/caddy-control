-- AlterTable
ALTER TABLE "Domains" ADD COLUMN "healthCheckInterval" INTEGER;
ALTER TABLE "Domains" ADD COLUMN "healthCheckMethod" TEXT;
ALTER TABLE "Domains" ADD COLUMN "healthCheckUrl" TEXT;
ALTER TABLE "Domains" ADD COLUMN "lastCheckedAt" DATETIME;
ALTER TABLE "Domains" ADD COLUMN "lastHealthStatus" BOOLEAN;
