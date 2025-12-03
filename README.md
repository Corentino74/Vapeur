# 🎮 Vapeur

**Vapeur est une mini-application Web permettant de gèrer une bibliothèque de jeu vidéo, avec leurs editeur et les différents genres de jeux existant**


## 💻 Comment l'installer ?



## 📄 Fonctionalités (suivant le cahier des charges) :
- Disposer des éléments suivants : Jeux, Éditeurs, Genres (cf structure de la base de données)
- Ajouter les CRUD POUR pour chaques éléments
- Afficher une page principale sur laquelle on peut ajouter un ou plusieurs jeux mis en avant
- Les listes doivent êtres triées par ordre alphabétique
- Inclure une navigation principale
- Rendre tout les éléments cliquables (*Cliquer sur un jeu permet d'acceder aussi à son éditeur, duquel on peut voir tout les jeux associés...*)


## 📁 Structure globale du projet

**Version en cours de dévloppement !**
```
Vapeur/
├── img/                   # Images utilisées
│   ├── fond.png              # Image de fond
│   └── vapeur.png            # Logo principal
├──prisma/                # Configuration base de données
│   └── schema.prisma         # Schéma de la DB
├──views/                 # Templates Handlebars
│   ├── Editeurs/         # Pages éditeurs
│   │   └── index.hbs        
│   ├── Genres/           # Pages genres
│   │   └── index.hbs        
│   ├── Jeux/             # Pages jeux
│   │   └── index.hbs        
│   ├── partials/         # Composants réutilisables
│   │   ├── header.hbs       # Navigation principale
│   │   └── footer.hbs       # Pied de page
│   ├── layout.hbs           # Template principal
│   └── index.hbs            # Page d'accueil
├── general.css           # Styles principaux
├── index.js              # Serveur Express principal
├── package.json          # Dépendances npm
├── prisma.config.ts      # Configuration Prisma
└── README.md             # Documentation
```

## 🗄️ Modèle de données

```prisma
model JeuVideo {
  id          Int      @id @default(autoincrement())
  titre       String   @unique
  description String
  releaseDate DateTime @default(now())
  mis_avant   Boolean  @default(false)
  
  // Relations
  genre       Genre    @relation(fields: [genreId], references: [id])
  genreId     Int
  editeur     Editeur  @relation(fields: [editeurId], references: [id])
  editeurId   Int
}

model Genre {
  id            Int         @id @default(autoincrement())
  nom           String      @unique
  jeux_associes JeuVideo[]
}

model Editeur {
  id           Int         @id @default(autoincrement())
  nom          String      @unique
  jeux_publies JeuVideo[]
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