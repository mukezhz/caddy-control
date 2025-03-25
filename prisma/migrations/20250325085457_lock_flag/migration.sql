-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Domains" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incomingAddress" TEXT NOT NULL,
    "destinationAddress" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Domains" ("createdAt", "destinationAddress", "id", "incomingAddress", "port") SELECT "createdAt", "destinationAddress", "id", "incomingAddress", "port" FROM "Domains";
DROP TABLE "Domains";
ALTER TABLE "new_Domains" RENAME TO "Domains";
CREATE UNIQUE INDEX "Domains_incomingAddress_key" ON "Domains"("incomingAddress");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
