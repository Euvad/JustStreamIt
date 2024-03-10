const BASE_URL = 'http://localhost:8000/api/v1';

async function fetchData(endpoint, options = {}) {
  const url = `${BASE_URL}/${endpoint}`;

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

async function getTopMovie() {
  try {
    const data = await fetchData('titles/?format=json&sort_by=-imdb_score');
    if (data.results && data.results.length > 0) {
      return data.results[0].id;
    } else {
      throw new Error('No movies found');
    }
  } catch (error) {
    console.error('Error getting top movie:', error);
    throw error;
  }
}
async function getTop7MoviesByCategory(category = '') {
  let top7Movies = [];
  let page = 1;

  try {
    while (top7Movies.length < 7) {
      const data = await fetchData(`titles/?format=json&genre=${category}&page=${page}&sort_by=-imdb_score`);
      const movies = data.results;

      if (movies.length === 0) {
        // Il n'y a plus de films sur cette page, donc nous avons récupéré tous les films
        break;
      }

      // Ajouter les ID des films de cette page à la liste des 7 premiers films
      for (let movie of movies) {
        top7Movies.push(movie.id);
        if (top7Movies.length === 7) break; // Sortir de la boucle si nous avons atteint 7 films
      }

      // Passer à la page suivante si nécessaire
      page++;
    }
    return top7Movies;
  } catch (error) {
    console.error(`Error getting top 7 movies for category ${category}:`, error);
    throw error;
  }
}


async function getMovieDetails(movieId) {
  const url = `titles/${movieId}`;

  try {
    const movieData = await fetchData(url);
    return movieData;
  } catch (error) {
    console.error('Error getting movie details:', error);
    throw error;
  }
}

async function displayTopRatedMovie() {
  let topRatedMovieId = await getTopMovie()

  try {
    const movieDetails = await getMovieDetails(topRatedMovieId);
    const bestMovieTitle = document.querySelector('.best-movie__leftside__title');
    const bestMovieSummary = document.querySelector('.best-movie__leftside__summary');
    const bestMovieImage = document.querySelector('.best-movie__rightside__image');

    bestMovieTitle.textContent = movieDetails.title;
    bestMovieSummary.textContent = movieDetails.long_description;
    bestMovieImage.src = movieDetails.image_url;
  } catch (error) {
    console.error('Error displaying top rated movie:', error);
  }
}
async function displayBestMovies() {
  try {
    // Obtenez les identifiants des 7 meilleurs films
    const bestMoviesIds = await getTop7MoviesByCategory();
    const moviesImages = [];
    // Récupérez les détails de chaque film et leurs images
    for (const movieId of bestMoviesIds) {
      const movieDetails = await getMovieDetails(movieId);
      moviesImages.push(movieDetails.image_url);
      if (moviesImages.length === 7) break; // Sortir de la boucle si nous avons atteint 7 films
    }
    console.log("Liens des images des meilleurs films:", moviesImages);

    // Génération dynamique des éléments img avec les images
    const carouselWrapper = document.getElementById("carousel");
    moviesImages.forEach(imageUrl => {
      const image = document.createElement("img");
      image.classList.add("hdcarousel_item");
      image.src = imageUrl;
      carouselWrapper.appendChild(image);
    });
  } catch (error) {
    console.error('Erreur lors de l\'affichage des meilleurs films :', error);
  }
}



// Appelez la fonction pour afficher les meilleurs films
displayBestMovies();
displayTopRatedMovie();

