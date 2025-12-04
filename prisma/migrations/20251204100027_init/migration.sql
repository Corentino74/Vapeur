-- CreateTable
CREATE TABLE "JeuVideo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "releaseDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mis_avant" BOOLEAN NOT NULL DEFAULT false,
    "editeurId" INTEGER NOT NULL,
    CONSTRAINT "JeuVideo_editeurId_fkey" FOREIGN KEY ("editeurId") REFERENCES "Editeur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JeuVideoGenre" (
    "jeuId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    PRIMARY KEY ("jeuId", "genreId"),
    CONSTRAINT "JeuVideoGenre_jeuId_fkey" FOREIGN KEY ("jeuId") REFERENCES "JeuVideo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JeuVideoGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Editeur" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "JeuVideo_titre_key" ON "JeuVideo"("titre");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_nom_key" ON "Genre"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Editeur_nom_key" ON "Editeur"("nom");
