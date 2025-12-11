// Système de recherche globale
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let searchTimeout;

    if (!searchInput || !searchResults) {
        return;
    }

    // Fonction pour effectuer la recherche
    async function performSearch(query) {
        if (query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('visible');
            return;
        }

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            displayResults(data.results);
        } catch (error) {
            searchResults.innerHTML = '<div class="search-error">Erreur de recherche</div>';
            searchResults.classList.add('visible');
        }
    }

    // Fonction pour afficher les résultats
    function displayResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>';
            searchResults.classList.add('visible');
            return;
        }

        // Grouper par type
        const groupedResults = results.reduce((acc, result) => {
            if (!acc[result.type]) acc[result.type] = [];
            acc[result.type].push(result);
            return acc;
        }, {});

        let html = '';
        
        // Ordre d'affichage : jeux, genres, éditeurs
        const typeLabels = {
            'jeu': 'Jeux',
            'genre': 'Genres', 
            'editeur': 'Éditeurs'
        };

        Object.keys(typeLabels).forEach(type => {
            if (groupedResults[type]) {
                html += `<div class="result-group">
                    <div class="result-group-title">${typeLabels[type]}</div>`;
                
                groupedResults[type].forEach(result => {
                    html += `<a href="${result.url}" class="result-item" data-type="${result.type}">
                        <span class="result-title">${result.titre}</span>
                    </a>`;
                });
                
                html += '</div>';
            }
        });

        searchResults.innerHTML = html;
        searchResults.classList.add('visible');
    }

    // Gestionnaire d'événements pour la saisie
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();

        
        // Débounce pour éviter trop de requêtes
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });



    // Masquer les résultats quand on clique ailleurs
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            searchResults.classList.remove('visible');
        }
    });

    // Afficher les résultats quand on clique sur l'input
    searchInput.addEventListener('focus', function() {
        if (searchInput.value.length >= 2) {
            searchResults.classList.add('visible');
        }
    });

    // Gestion des touches
    searchInput.addEventListener('keydown', function(e) {
        const items = searchResults.querySelectorAll('.result-item');
        const activeItem = searchResults.querySelector('.result-item.active');
        let activeIndex = Array.from(items).indexOf(activeItem);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                activeIndex = Math.min(activeIndex + 1, items.length - 1);
                updateActiveItem(items, activeIndex);
                break;
            case 'ArrowUp':
                e.preventDefault();
                activeIndex = Math.max(activeIndex - 1, 0);
                updateActiveItem(items, activeIndex);
                break;
            case 'Enter':
                e.preventDefault();
                if (activeItem) {
                    window.location.href = activeItem.href;
                }
                break;
            case 'Escape':
                searchResults.classList.remove('visible');
                searchInput.blur();
                break;
        }
    });

    function updateActiveItem(items, activeIndex) {
        items.forEach((item, index) => {
            item.classList.toggle('active', index === activeIndex);
        });
    }
});