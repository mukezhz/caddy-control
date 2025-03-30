/*
  Warnings:

  - The primary key for the `ApiKeys` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ApiKeys` table. All the data in the column will be lost.
  - Added the required column `name` to the `ApiKeys` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKeys" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ApiKeys" ("createdAt", "key") SELECT "createdAt", "key" FROM "ApiKeys";
DROP TABLE "ApiKeys";
ALTER TABLE "new_ApiKeys" RENAME TO "ApiKeys";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
