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

// A VOIR SI CONSERVÉ !
// Helpers Handlebars
hbs.registerHelper('formatDate', function(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
});

hbs.registerHelper('eq', function(a, b) {
    return a === b;
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

hbs.registerHelper('formatTime', function(date) {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
});

hbs.registerHelper('isGenreSelected', function(jeuGenres, genreId) {
    if (!jeuGenres || !Array.isArray(jeuGenres)) return false;
    return jeuGenres.some(jeuGenre => jeuGenre.genre.id === genreId);
});

// Body Parser 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware pour les fichiers statiques (CSS, JS, images...)
app.use(express.static(path.join(__dirname, 'public')));
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
    console.error('Erreur lors de l\'initialisation des genres:', error);
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
            orderBy: {
                titre: 'asc'
            }
        });
        response.render("index", { jeuxMisEnAvant });
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux mis en avant:', error);
        response.render("index", { jeuxMisEnAvant: [] });
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
        console.error('Erreur lors de la récupération des jeux:', error);
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
        console.error('Erreur lors du chargement du formulaire:', error);
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
        console.error('Erreur lors de la création du jeu:', error);
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
        console.error('Erreur lors du chargement du jeu:', error);
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
        console.error('Erreur lors de la modification du jeu:', error);
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
        console.error('Erreur lors de la suppression du jeu:', error);
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
        console.error('Erreur lors de la récupération du jeu:', error);
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
        console.error('Erreur lors du basculement de la mise en avant:', error);
        response.status(500).json({ success: false, error: error.message });
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
        console.error('Erreur lors de la récupération des genres:', error);
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
        console.error('Erreur lors de la récupération du genre:', error);
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
        console.error('Erreur lors de la récupération des éditeurs:', error);
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
        console.error('Erreur lors de la création de l\'éditeur:', error);
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
        console.error('Erreur lors du chargement de l\'éditeur:', error);
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
        console.error('Erreur lors de la modification de l\'éditeur:', error);
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
        console.error('Erreur lors de la suppression de l\'éditeur:', error);
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
        console.error('Erreur lors de la récupération de l\'éditeur:', error);
        response.redirect('/editeurs');
    }
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
async function startServer() {
    // Initialiser les genres avant de démarrer le serveur
    await initializeGenres();
    
    // Démarrer le serveur
    app.listen(port, function() {
        console.log(`Server is running at http://localhost:${port}`);
    });
}
startServer();
