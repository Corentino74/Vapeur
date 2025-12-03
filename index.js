// ---- Setup ----

// Le Path 
const path = require('path');

// Express
const express = require('express');
const app = express();
const port = 8080;

// Handlebars
const hbs = require("hbs");
// Configuration de Handlebars pour Express
app.set("view engine", "hbs"); // On définit le moteur de template que Express va utiliser
app.set("views", path.join(__dirname, "views")); // On définit le dossier des vues (dans lequel se trouvent les fichiers .hbs)
hbs.registerPartials(path.join(__dirname, "views", "partials")); // On définit le dossier des partials (composants e.g. header, footer, menu...)

// Body Parser 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware pour les fichiers statiques (CSS, JS, images...)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



// ----** Routes **---- 


// -- Route racine
app.get('/', function(request, response) {
    response.render("index");
})


// -- Routes Jeux 
//-Page liste des jeux
app.get('/jeux', async function(request, response) {
    response.render("Jeux/index");
})
//-Formulaire d'ajout d'un jeu
app.get('/jeux/ajouter', async function(request, response) {
    //TODO: envoyer le formulaire d'ajout d'un jeu
});
//-Modification d'un jeu
app.get('/jeux/modifier/:id', async function(request, response) {
    //TODO: récupérer les détails d'un jeu en base de données et les envoyer à la vue hbs pour affichage dans le formulaire de modification
});
//-Page détail d'un jeu
app.get('/jeux/:id', async function(request, response) {
    //TODO: récupérer les détails d'un jeu en base de données et les envoyer à la vue hbs pour affichage
});


// -- Routes Genres
//-Page liste des genres
app.get('/genres', async function(request, response) {
    response.render("Genres/index");
})
//-Formulaire d'ajout d'un genre
app.get('/genres/ajouter', async function(request, response) {  
    //TODO: envoyer le formulaire d'ajout d'un genre
});
//-Modification d'un genre
app.get('/genres/modifier/:id', async function(request, response) {
    //TODO: récupérer les détails d'un genre en base de données et les envoyer à la vue hbs pour affichage dans le formulaire de modification
});
//-Page détail d'un genre
app.get('/genres/:id', async function(request, response) {
    //TODO: récupérer les détails d'un genre en base de données et les envoyer à la vue hbs pour affichage
});


// -- Routes Editeurs
//-Page liste des éditeurs
app.get('/editeurs', async function(request, response) {
    response.render("Editeurs/index");
})
//-Formulaire d'ajout d'un éditeur
app.get('/editeurs/ajouter', async function(request, response) {
    //TODO: envoyer le formulaire d'ajout d'un éditeur
});
//-Modification d'un éditeur
app.get('/editeurs/modifier/:id', async function(request, response) {
    //TODO: récupérer les détails d'un éditeur en base de données et les envoyer à la vue hbs pour affichage dans le formulaire de modification
});
//-Page détail d'un éditeur
app.get('/editeurs/:id', async function(request, response) {
    //TODO: récupérer les détails d'un éditeur en base de données et les envoyer à la vue hbs pour affichage
});

// ---- Middlewares d'erreurs ----

app.use(function(err, request, response, next) {
    console.error(err)
    response.status(500).send('Something broke!')
})

app.use(function(request, response) {
    console.log("404 Middleware exécuté")
    response.render("index"); // Renvoi à la page d'accueil pour l'instant, mais problème de navigation ? Lien incorrect ?
})


// ---- Lancement du serveur ----
app.listen(port, function() {
    console.log(`Server is running at http://localhost:${port}`);
});