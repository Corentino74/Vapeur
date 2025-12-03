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
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Prisma
const { PrismaClient } = require('@prisma/client');
const {Database} = require('sqlite3');
const {send} = require("process");
const prisma = new PrismaClient();

// Middleware pour les fichiers statiques (CSS, JS, images...)
// Serve `public/` first (recommended). Also serve the project root so
// files placed at the repository root (e.g. `/style.css`) are reachable
// during development. In production prefer a single dedicated `public/` folder.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));



// ---- Routes ---- 

// Route racine


app.use(function(err, request, response, next) {
    console.error(err)
    response.status(500).send('Something broke!')
})

app.use(function(request, response) {
    console.log("404 Middleware exécuté")
    response.status(404)
})
