-- CreateTable
CREATE TABLE "CaddyConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "config" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Domains" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incomingAddress" TEXT NOT NULL,
    "destinationAddress" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Domains_incomingAddress_key" ON "Domains"("incomingAddress");
