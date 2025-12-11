// Gestion de la mise en avant des jeux
document.addEventListener('DOMContentLoaded', function() {
    // Gérer les clics sur les étoiles
    const stars = document.querySelectorAll('.featured-star');
    
    stars.forEach(star => {
        star.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const gameCardWrapper = this.closest('.game-card-wrapper');
            const gameId = gameCardWrapper.dataset.gameId;
            const isFeatured = this.classList.contains('active');
            
            // Basculer l'état de l'étoile immédiatement pour le feedback utilisateur
            if (isFeatured) {
                this.classList.remove('active');
                this.title = 'Mettre en avant';
                gameCardWrapper.dataset.featured = 'false';
            } else {
                this.classList.add('active');
                this.title = 'Retirer de la mise en avant';
                gameCardWrapper.dataset.featured = 'true';
            }
            
            // Envoyer la requête au serveur
            fetch(`/jeux/${gameId}/toggle-featured`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    featured: !isFeatured
                })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    // Revenir à l'état précédent en cas d'erreur
                    if (!isFeatured) {
                        this.classList.remove('active');
                        this.title = 'Mettre en avant';
                        gameCardWrapper.dataset.featured = 'false';
                    } else {
                        this.classList.add('active');
                        this.title = 'Retirer de la mise en avant';
                        gameCardWrapper.dataset.featured = 'true';
                    }
                    console.error('Erreur lors de la mise à jour:', data.error);
                }
            })
            .catch(error => {
                // Revenir à l'état précédent en cas d'erreur
                if (!isFeatured) {
                    this.classList.remove('active');
                    this.title = 'Mettre en avant';
                    gameCard.dataset.featured = 'false';
                } else {
                    this.classList.add('active');
                    this.title = 'Retirer de la mise en avant';
                    gameCard.dataset.featured = 'true';
                }
                console.error('Erreur réseau:', error);
            });
        });
    });
});