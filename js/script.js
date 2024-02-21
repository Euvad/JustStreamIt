document.addEventListener('DOMContentLoaded', function() {
    const bestMovieContainer = document.getElementById('best-movie');
    const scrollableList = document.getElementById('scrollable-list');
    const modal = document.getElementById('modal');
    const modalContent = document.querySelector('.modal-content');

    // Fonction pour récupérer les données d'un film par son ID
    async function fetchMovieDetails(movieId) {
        const response = await fetch(`http://localhost:8000/api/v1/titles/${movieId}`);
        const data = await response.json();
        return data;
    }

    // Fonction pour remplir les détails du film dans la fenêtre modale
    function fillModal(movieDetails) {
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <img id="modal-image" src="${movieDetails.image_url}" alt="${movieDetails.title}">
            <h2 id="modal-title">${movieDetails.title}</h2>
            <p id="modal-genre">Genre complet: ${movieDetails.genres.join(', ')}</p>
            <p id="modal-release-date">Date de sortie: ${movieDetails.date_published}</p>
            <p id="modal-rated">Rated: ${movieDetails.rated}</p>
            <p id="modal-imdb-score">Score Imdb: ${movieDetails.imdb_score}</p>
            <p id="modal-director">Réalisateur: ${movieDetails.directors.join(', ')}</p>
            <p id="modal-actors">Acteurs: ${movieDetails.actors.join(', ')}</p>
            <p id="modal-duration">Durée: ${movieDetails.duration}</p>
            <p id="modal-country">Pays d'origine: ${movieDetails.countries.join(', ')}</p>
            <p id="modal-box-office">Résultat au Box Office: ${movieDetails.worldwide_gross_income}</p>
            <p id="modal-summary">Résumé du film: ${movieDetails.description}</p>
        `;
        modal.style.display = 'block';
    }

    // Écouteur de clic pour ouvrir la fenêtre modale avec les détails du film
    bestMovieContainer.addEventListener('click', async function() {
        const movieId = 499549; // ID du meilleur film, à remplacer par l'ID du film souhaité
        const movieDetails = await fetchMovieDetails(movieId);
        fillModal(movieDetails);
    });

    // Écouteur de clic pour fermer la fenêtre modale
    modal.addEventListener('click', function(event) {
        if (event.target.classList.contains('close') || event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Fonction pour récupérer les films les mieux notés
    async function fetchTopRatedMovies() {
        const response = await fetch('http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&min_year=2010');
        const data = await response.json();
        return data.results;
    }

    // Fonction pour afficher les films les mieux notés
    async function displayTopRatedMovies() {
        const topRatedMovies = await fetchTopRatedMovies();
        topRatedMovies.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');
            movieItem.innerHTML = `
                <img src="${movie.image_url}" alt="${movie.title}">
                <h2>${movie.title}</h2>
                <p>${movie.description}</p>
            `;
            scrollableList.appendChild(movieItem);
        });
    }

    // Appel de la fonction pour afficher les films les mieux notés
    displayTopRatedMovies();
});
