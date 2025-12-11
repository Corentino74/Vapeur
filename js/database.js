// Données et fonctions d'initialisation de la base de données

// Liste des genres prédéfinis
const genres = [
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
  { nom: 'Pvp' },
  { nom: 'Coop' },
  { nom: 'Textuel' },
  { nom : 'Fantasy' },
  { nom : 'Science-Fiction' },
  { nom : 'Dark Fantasy' },
  { nom : 'de type souls'}
];

// Fonction pour initialiser les genres prédéfinis en base de données
async function initializeGenres(prisma) {
  try {
    for (const genre of genres) {
      await prisma.genre.upsert({
        where: { nom: genre.nom },
        update: {},
        create: genre
      });
    }
  } catch (error) {
    console.error('Erreur avec les genres à la génération !', error);
    throw error;
  }
}

// Exporter les genres et la fonction d'initialisation
module.exports = {
  genres,
  initializeGenres
};