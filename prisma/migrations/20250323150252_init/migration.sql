-- CreateTable
CREATE TABLE "CaddyConfiguration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Domains" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "incomingAddress" TEXT NOT NULL,
    "destinationAddress" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Domains_incomingAddress_key" ON "Domains"("incomingAddress");
