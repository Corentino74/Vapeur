# 🎮 Vapeur

**Vapeur est une mini-application Web permettant de gèrer une bibliothèque de jeu vidéo, avec leurs editeur et les différents genres de jeux existant**


## 💻 Comment l'installer ?
- Clonez le repository

- Ouvrez un terminal :
- tapez la commande : 
```
npm i
```
- créez si il n'es pas déjà présent le fichier .env à la racine avec comme contenu : 
```
DATABASE_URL="file:./dev.db" 
```
- tapez la commande :
```
npx prisma migrate deploy
```
- tapez la commande :
```
npm run start
```

## 📄 Fonctionalités (suivant le cahier des charges) :
- Disposer des éléments suivants : Jeux, Éditeurs, Genres (cf structure de la base de données)
- Ajouter les CRUD POUR pour chaques éléments
- Afficher une page principale sur laquelle on peut ajouter un ou plusieurs jeux mis en avant
- Les listes doivent êtres triées par ordre alphabétique
- Inclure une navigation principale
- Rendre tout les éléments cliquables (*Cliquer sur un jeu permet d'acceder aussi à son éditeur, duquel on peut voir tout les jeux associés...*)


## 📁 Structure globale du projet

**Version en cours de développement !**
```
Vapeur/
├── img/                      # Images utilisées
│   ├── fond.png             # Image de fond
│   └── vapeur.png           # Logo principal
├── js/                      # Scripts côté client
│   └── featured.js          # Système d'étoiles pour jeux mis en avant
├── pages/                   # Pages statiques
├── prisma/                  # Configuration base de données
│   ├── schema.prisma        # Schéma de la DB (SQLite)
│   └── migrations/          # Historique des migrations
├── views/                   # Templates Handlebars
│   ├── Editeurs/            # Pages éditeurs
│   │   ├── index.hbs        # Liste des éditeurs
│   │   ├── detail.hbs       # Page détail éditeur
│   │   ├── ajouter.hbs      # Formulaire ajout éditeur
│   │   └── modifier.hbs     # Formulaire modification éditeur
│   ├── Genres/              # Pages genres  
│   │   ├── index.hbs        # Liste des genres
│   │   └── detail.hbs       # Page détail genre (jeux associés)
│   ├── Jeux/                # Pages jeux
│   │   ├── index.hbs        # Liste des jeux
│   │   ├── detail.hbs       # Page détail jeu
│   │   ├── ajouter.hbs      # Formulaire ajout jeu
│   │   └── modifier.hbs     # Formulaire modification jeu
│   ├── partials/            # Composants réutilisables
│   │   ├── header.hbs       # Navigation principale
│   │   └── footer.hbs       # Pied de page
│   ├── layout.hbs           # Template principal
│   └── index.hbs            # Page d'accueil avec jeux mis en avant
├── general.css              # Styles principaux (design Steam-like)
├── index.js                 # Serveur Express avec toutes les routes
├── package.json             # Dépendances npm
├── prisma.config.ts         # Configuration Prisma TypeScript
└── README.md                # Documentation
```

## 🗄️ Modèle de données

```prisma
// Jeux vidéo - Modèle principal
model JeuVideo {
  id          Int       @id @default(autoincrement())
  titre       String    @unique
  description String
  releaseDate DateTime? // Date optionnelle
  mis_avant   Boolean   @default(false) // Système d'étoiles pour page d'accueil
  image       String?   // URL ou chemin vers l'image du jeu (optionnel)
  
  // Relations
  editeur     Editeur?  @relation(fields: [editeurId], references: [id])
  editeurId   Int?      // Éditeur optionnel
  genres      JeuVideoGenre[] // Relation Many-to-Many avec les genres
}

// Genres de jeux - Liste prédéfinie
model Genre {
  id    Int    @id @default(autoincrement())
  nom   String @unique
  
  // Relation Many-to-Many avec les jeux
  jeux  JeuVideoGenre[]
}

// Table de jointure pour la relation Many-to-Many Jeux <-> Genres
model JeuVideoGenre {
  jeu     JeuVideo @relation(fields: [jeuId], references: [id], onDelete: Cascade)
  jeuId   Int
  genre   Genre    @relation(fields: [genreId], references: [id], onDelete: Cascade)
  genreId Int
  @@id([jeuId, genreId])
}

// Éditeurs de jeux
model Editeur {
  id           Int        @id @default(autoincrement())
  nom          String     @unique
  
  // Relations
  jeux_publies JeuVideo[] // Un éditeur peut publier plusieurs jeux
}
```


#### </> Technologies utilisées 
- Express
- Nodemon
- Prisma v6.19.0
- sqlite3
- Handlebars
- Vs Code
- langage principaux : Js, HTML, CSS


>*Ce projet est réalisé dans le cadre du cours **R3.01 Développement Web** - IUT Informatique*

---

>Réalisé par 🧙‍♂️Corentin Chitwood🧙‍♂️