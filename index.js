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

// Helpers Handlebars essentiels
// Helper pour formater les dates en français
hbs.registerHelper('formatDate', function(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
});

hbs.registerHelper('formatTime', function(date) {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
});

hbs.registerHelper('eq', function(a, b) {
    return a === b;
});

hbs.registerHelper('unless', function(conditional, options) {
    if (!conditional) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

hbs.registerHelper('includes', function(array, value) {
    if (!array || !Array.isArray(array)) return false;
    return array.some(item => {
        if (typeof item === 'object' && item.genre) {
            return item.genre.id === value;
        }
        return item === value;
    });
});

hbs.registerHelper('isGenreSelected', function(jeuGenres, genreId) {
    if (!jeuGenres || !Array.isArray(jeuGenres)) return false;
    return jeuGenres.some(jeuGenre => jeuGenre.genre.id === genreId);
});

hbs.registerHelper('formField', function(options) {
    const { type, id, name, label, placeholder, required, rows, value } = options.hash;
    let input = '';
    
    switch (type) {
        case 'text':
        case 'url':
        case 'date':
            input = `<input type="${type}" id="${id}" name="${name}" class="form-control" ${placeholder ? `placeholder="${placeholder}"` : ''} ${required ? 'required' : ''} ${value ? `value="${value}"` : ''}>`;
            break;
        case 'textarea':
            input = `<textarea id="${id}" name="${name}" class="form-control" ${rows ? `rows="${rows}"` : ''} ${required ? 'required' : ''}>${value || ''}</textarea>`;
            break;
        case 'select':
            input = `<select id="${id}" name="${name}" class="form-control">${options.fn(this)}</select>`;
            break;
    }
    
    return new hbs.SafeString(
        `<div class="form-group">
            <label for="${id}">${label}</label>
            ${input}
        </div>`
    );
});

// Helper for rendering buttons
hbs.registerHelper('button', function(options) {
    const { type = 'button', class: className = 'btn', href, onclick, text } = options.hash;
    if (href) {
        return new hbs.SafeString(`<a href="${href}" class="${className}">${text}</a>`);
    }
    return new hbs.SafeString(`<button type="${type}" class="${className}"${onclick ? ` onclick="${onclick}"` : ''}>${text}</button>`);
});

// Helper for form input groups
hbs.registerHelper('formField', function(options) {
    const { type = 'text', id, name, label, required, value = '', placeholder = '', rows } = options.hash;
    const reqAttr = required ? ' required' : '';
    const valAttr = value ? ` value="${value}"` : '';
    const placeholderAttr = placeholder ? ` placeholder="${placeholder}"` : '';
    
    let input;
    if (type === 'textarea') {
        input = `<textarea id="${id}" name="${name}"${reqAttr}${rows ? ` rows="${rows}"` : ''}${placeholderAttr}>${value}</textarea>`;
    } else if (type === 'select') {
        input = `<select id="${id}" name="${name}"${reqAttr}>${options.fn(this)}</select>`;
    } else {
        input = `<input type="${type}" id="${id}" name="${name}"${reqAttr}${valAttr}${placeholderAttr}>`;
    }
    
    return new hbs.SafeString(
        `<div class="form-group">
` +
        `    <label for="${id}">${label}${required ? ' *' : ''}</label>
` +
        `    ${input}
` +
        `</div>`
    );
});

// Helper for pluralization
hbs.registerHelper('pluralize', function(count, singular, plural) {
    return count === 1 ? singular : (plural || singular + 's');
});



// Body Parser 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// Middleware pour les fichiers statiques (CSS, JS, images...)
app.use(express.static(path.join(__dirname)));

// Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// ---- Initialisation des données ----

// Genres de jeux
const genresPredefined = [
  { nom: 'Action' },
  { nom: 'Aventure' },
  { nom: 'RPG' },
  { nom: 'Simulation' },
  { nom: 'Sport' },
  { nom: 'MMORPG' },
  { nom: 'Sandbox' },
  { nom: 'Shooter' },
  { nom: 'Tour par tour' },
  { nom: 'Horreur' },
  { nom: 'Stratégie' },
  { nom: 'Puzzle' },
  { nom: 'Course' },
  { nom: 'Plateforme' },
  { nom: 'Combat' }, 
  { nom: 'Pvp' }
];

// Fonction pour initialiser les genres prédéfinis
async function initializeGenres() {
  try {
    for (const genre of genresPredefined) {
      await prisma.genre.upsert({
        where: { nom: genre.nom },
        update: {},
        create: genre
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des genres :', error);
  }
}

// ----** Routes **---- 

// -- Route racine
app.get('/', async function(request, response) {
    try {
        const jeuxMisEnAvant = await prisma.jeuVideo.findMany({
            where: { mis_avant: true },
            include: {
                editeur: true,
                genres: {
                    include: {
                        genre: true
                    }
                }
            },
            orderBy: {titre: 'asc'}
        });

        const editeurs = await prisma.editeur.findMany({
            include: {
                jeux_publies: true
            },
            orderBy: {nom: 'asc'}
        });

        const editeursAvecCompte = editeurs.map(editeur => ({
            ...editeur,
            nbJeux: editeur.jeux_publies.length
        }));

        response.render("index", { jeuxMisEnAvant, editeurs: editeursAvecCompte });
    } catch (error) {
        console.error('Erreur lors du rendu de la page d\'accueil:', error);
        response.status(500).send('Erreur 500: ' + error.message);
    }
})

// -- Routes Jeux 
// Page liste des jeux (triés alphabétiquement)
app.get('/jeux', async function(request, response) {
    try {
        const jeux = await prisma.jeuVideo.findMany({
            include: {
                editeur: true,
                genres: {
                    include: {
                        genre: true
                    }
                }
            },
            orderBy: {
                titre: 'asc'
            }
        });
        response.render("Jeux/index", { jeux });
    } catch (error) {
        response.render("Jeux/index", { jeux: [] });
    }
});

// Formulaire d'ajout d'un jeu
app.get('/jeux/ajouter', async function(request, response) {
    try {
        const genres = await prisma.genre.findMany({
            orderBy: { nom: 'asc' }
        });
        const editeurs = await prisma.editeur.findMany({
            orderBy: { nom: 'asc' }
        });
        response.render("Jeux/ajouter", { genres, editeurs });
    } catch (error) {
        response.redirect('/jeux');
    }
});

// Traitement ajout d'un jeu
app.post('/jeux/ajouter', async function(request, response) {
    try {
        const { titre, description, releaseDate, editeurId, genreIds, mis_avant, image } = request.body;
        
        // Créer le jeu
        const gameData = {
            titre,
            description,
            mis_avant: mis_avant === 'on',
            image: image || null
        };
        
        if (releaseDate) {
            gameData.releaseDate = new Date(releaseDate);
        }
        
        if (editeurId) {
            gameData.editeurId = parseInt(editeurId);
        }
        
        const jeu = await prisma.jeuVideo.create({
            data: gameData
        });

        // Associer les genres
        if (genreIds) {
            const genreIdsArray = Array.isArray(genreIds) ? genreIds : [genreIds];
            for (const genreId of genreIdsArray) {
                await prisma.jeuVideoGenre.create({
                    data: {
                        jeuId: jeu.id,
                        genreId: parseInt(genreId)
                    }
                });
            }
        }

        response.redirect('/jeux');
    } catch (error) {
        response.redirect('/jeux/ajouter');
    }
});

// Formulaire de modification d'un jeu
app.get('/jeux/modifier/:id', async function(request, response) {
    try {
        const jeuId = parseInt(request.params.id);
        const jeu = await prisma.jeuVideo.findUnique({
            where: { id: jeuId },
            include: {
                editeur: true,
                genres: {
                    include: {
                        genre: true
                    }
                }
            }
        });

        if (!jeu) {
            return response.redirect('/jeux');
        }

        const genres = await prisma.genre.findMany({
            orderBy: { nom: 'asc' }
        });
        const editeurs = await prisma.editeur.findMany({
            orderBy: { nom: 'asc' }
        });

        response.render("Jeux/modifier", { jeu, genres, editeurs });
    } catch (error) {
        response.redirect('/jeux');
    }
});

// Traitement modification d'un jeu
app.post('/jeux/modifier/:id', async function(request, response) {
    try {
        const jeuId = parseInt(request.params.id);
        const { titre, description, releaseDate, editeurId, genreIds, mis_avant, image } = request.body;

        // Mettre à jour le jeu
        const updateData = {
            titre,
            description,
            mis_avant: mis_avant === 'on',
            image: image || null
        };
        
        if (releaseDate) {
            updateData.releaseDate = new Date(releaseDate);
        } else {
            updateData.releaseDate = null;
        }
        
        if (editeurId) {
            updateData.editeurId = parseInt(editeurId);
        } else {
            updateData.editeurId = null;
        }
        
        await prisma.jeuVideo.update({
            where: { id: jeuId },
            data: updateData
        });

        // Supprimer les anciennes associations de genres
        await prisma.jeuVideoGenre.deleteMany({
            where: { jeuId }
        });

        // Ajouter les nouvelles associations
        if (genreIds) {
            const genreIdsArray = Array.isArray(genreIds) ? genreIds : [genreIds];
            for (const genreId of genreIdsArray) {
                await prisma.jeuVideoGenre.create({
                    data: {
                        jeuId,
                        genreId: parseInt(genreId)
                    }
                });
            }
        }

        response.redirect(`/jeux/${jeuId}`);
    } catch (error) {
        response.redirect(`/jeux/modifier/${request.params.id}`);
    }
});

// Suppression d'un jeu
app.post('/jeux/supprimer/:id', async function(request, response) {
    try {
        const jeuId = parseInt(request.params.id);
        
        // Supprimer les relations genres (cascade automatique)
        await prisma.jeuVideo.delete({
            where: { id: jeuId }
        });

        response.redirect('/jeux');
    } catch (error) {
        response.redirect('/jeux');
    }
});

// Page détail d'un jeu
app.get('/jeux/:id', async function(request, response) {
    try {
        const jeuId = parseInt(request.params.id);
        const jeu = await prisma.jeuVideo.findUnique({
            where: { id: jeuId },
            include: {
                editeur: true,
                genres: {
                    include: {
                        genre: true
                    }
                }
            }
        });

        if (!jeu) {
            return response.redirect('/jeux');
        }

        response.render("Jeux/detail", { jeu });
    } catch (error) {
        response.redirect('/jeux');
    }
});

// API pour basculer la mise en avant d'un jeu
app.post('/jeux/:id/toggle-featured', async function(request, response) {
    try {
        const jeuId = parseInt(request.params.id);
        const { featured } = request.body;
        
        await prisma.jeuVideo.update({
            where: { id: jeuId },
            data: { mis_avant: featured }
        });
        
        response.json({ success: true });
    } catch (error) {
        response.status(500).json({ success: false, error: error.message });
    }
});

// API de recherche globale
app.get('/api/search', async function(request, response) {
    try {
        const query = request.query.q;
        if (!query || query.length < 2) {
            return response.json({ results: [] });
        }

        const searchTerm = `%${query}%`;
        
        // Recherche dans les jeux
        const jeux = await prisma.jeuVideo.findMany({
            where: {
                titre: {
                    contains: query
                }
            },
            take: 5,
            orderBy: { titre: 'asc' }
        });

        // Recherche dans les genres
        const genres = await prisma.genre.findMany({
            where: {
                nom: {
                    contains: query
                }
            },
            take: 3,
            orderBy: { nom: 'asc' }
        });

        // Recherche dans les éditeurs
        const editeurs = await prisma.editeur.findMany({
            where: {
                nom: {
                    contains: query
                }
            },
            take: 3,
            orderBy: { nom: 'asc' }
        });

        // Formater les résultats
        const results = [
            ...jeux.map(jeu => ({
                id: jeu.id,
                titre: jeu.titre,
                type: 'jeu',
                url: `/jeux/${jeu.id}`
            })),
            ...genres.map(genre => ({
                id: genre.id,
                titre: genre.nom,
                type: 'genre',
                url: `/genres/${genre.id}`
            })),
            ...editeurs.map(editeur => ({
                id: editeur.id,
                titre: editeur.nom,
                type: 'editeur',
                url: `/editeurs/${editeur.id}`
            }))
        ];

        response.json({ results });
    } catch (error) {
        response.status(500).json({ results: [], error: error.message });
    }
});




// -- Routes Genres
// Page liste des genres de jeux
app.get('/genres', async function(request, response) {
    try {
        const genres = await prisma.genre.findMany({
            include: {
                jeux: {
                    include: {
                        jeu: true
                    }
                }
            },
            orderBy: {
                nom: 'asc'
            }
        });
        
        // Calculer le nombre de jeux par genre
        const genresAvecCompte = genres.map(genre => ({
            ...genre,
            nbJeux: genre.jeux.length
        }));
        
        response.render("Genres/index", { genres: genresAvecCompte });
    } catch (error) {
        response.render("Genres/index", { genres: [] });
    }
});

// Page dédiée à un genre de jeux
app.get('/genres/:id', async function(request, response) {
    try {
        const genreId = parseInt(request.params.id);
        const genre = await prisma.genre.findUnique({
            where: { id: genreId },
            include: {
                jeux: {
                    include: {
                        jeu: {
                            include: {
                                editeur: true,
                                genres: {
                                    include: {
                                        genre: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!genre) {
            return response.redirect('/genres');
        }

        // Extraire les jeux du genre
        const jeux = genre.jeux.map(jeuGenre => jeuGenre.jeu);

        response.render("Genres/detail", { genre, jeux });
    } catch (error) {
        response.redirect('/genres');
    }
});


// -- Routes Editeurs
// Page liste des éditeurs
app.get('/editeurs', async function(request, response) {
    try {
        const editeurs = await prisma.editeur.findMany({
            include: {
                jeux_publies: true
            },
            orderBy: {
                nom: 'asc'
            }
        });
        
        // Calculer le nombre de jeux par éditeur
        const editeursAvecCompte = editeurs.map(editeur => ({
            ...editeur,
            nbJeux: editeur.jeux_publies.length
        }));
        
        response.render("Editeurs/index", { editeurs: editeursAvecCompte });
    } catch (error) {
        response.render("Editeurs/index", { editeurs: [] });
    }
});

// Formulaire d'ajout d'un éditeur
app.get('/editeurs/ajouter', async function(request, response) {
    response.render("Editeurs/ajouter");
});

// Traitement ajout d'un éditeur
app.post('/editeurs/ajouter', async function(request, response) {
    try {
        const { nom } = request.body;
        
        await prisma.editeur.create({
            data: { nom }
        });

        response.redirect('/editeurs');
    } catch (error) {
        response.redirect('/editeurs/ajouter');
    }
});

// Formulaire de modification d'un éditeur
app.get('/editeurs/modifier/:id', async function(request, response) {
    try {
        const editeurId = parseInt(request.params.id);
        const editeur = await prisma.editeur.findUnique({
            where: { id: editeurId },
            include: {
                jeux_publies: true
            }
        });

        if (!editeur) {
            return response.redirect('/editeurs');
        }

        response.render("Editeurs/modifier", { editeur });
    } catch (error) {
        response.redirect('/editeurs');
    }
});

// Traitement modification d'un éditeur
app.post('/editeurs/modifier/:id', async function(request, response) {
    try {
        const editeurId = parseInt(request.params.id);
        const { nom } = request.body;

        await prisma.editeur.update({
            where: { id: editeurId },
            data: { nom }
        });

        response.redirect(`/editeurs/${editeurId}`);
    } catch (error) {
        response.redirect(`/editeurs/modifier/${request.params.id}`);
    }
});

// Suppression d'un éditeur
app.post('/editeurs/supprimer/:id', async function(request, response) {
    try {
        const editeurId = parseInt(request.params.id);
        
        await prisma.editeur.delete({
            where: { id: editeurId }
        });

        response.redirect('/editeurs');
    } catch (error) {
        response.redirect('/editeurs');
    }
});

// Page détail d'un éditeur
app.get('/editeurs/:id', async function(request, response) {
    try {
        const editeurId = parseInt(request.params.id);
        const editeur = await prisma.editeur.findUnique({
            where: { id: editeurId },
            include: {
                jeux_publies: {
                    include: {
                        genres: {
                            include: {
                                genre: true
                            }
                        }
                    },
                    orderBy: {
                        titre: 'asc'
                    }
                }
            }
        });

        if (!editeur) {
            return response.redirect('/editeurs');
        }

        response.render("Editeurs/detail", { editeur });
    } catch (error) {
        response.redirect('/editeurs');
    }
});

// ---- Middlewares d'erreurs ----

app.use(function(err, request, response, next) {
    response.status(500).send('Something broke!')
})

app.use(function(request, response) {
    response.status(404);
    if (request.accepts('html')) {
        response.render("index", { error: "Page non trouvée" });
    } else if (request.accepts('json')) {
        response.json({ error: 'Page non trouvée' });
    } else {
        response.type('txt').send('Page non trouvée');
    }
})


// ---- Lancement du serveur ----
async function startServer() {
    try {
        console.log('Démarrage du serveur...');
        // Initialiser les genres avant de démarrer le serveur
        console.log('Initialisation des genres...');
        await initializeGenres();
        console.log('Genres initialisés avec succès');
        
        // Démarrer le serveur
        app.listen(port, function() {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
}

startServer().catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
});
