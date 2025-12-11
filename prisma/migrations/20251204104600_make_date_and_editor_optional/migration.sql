-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JeuVideo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "releaseDate" DATETIME,
    "mis_avant" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "editeurId" INTEGER,
    CONSTRAINT "JeuVideo_editeurId_fkey" FOREIGN KEY ("editeurId") REFERENCES "Editeur" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_JeuVideo" ("description", "editeurId", "id", "image", "mis_avant", "releaseDate", "titre") SELECT "description", "editeurId", "id", "image", "mis_avant", "releaseDate", "titre" FROM "JeuVideo";
DROP TABLE "JeuVideo";
ALTER TABLE "new_JeuVideo" RENAME TO "JeuVideo";
CREATE UNIQUE INDEX "JeuVideo_titre_key" ON "JeuVideo"("titre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
