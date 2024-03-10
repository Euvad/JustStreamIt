const BASE_URL = 'http://localhost:8000/api/v1';

async function fetchData(endpoint, options = {}) {
    const url = `${BASE_URL}/${endpoint}`;

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function getTopMovie() {
    try {
        const data = await fetchData('titles/?format=json&sort_by=-imdb_score');
        if (!data.results || !data.results.length) throw new Error('No movies found');
        return data.results[0].id;
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

            if (!movies.length) break;

            for (const movie of movies) {
                top7Movies.push(movie.id);
                if (top7Movies.length === 7) break;
            }
            page++;
        }
        return top7Movies;
    } catch (error) {
        console.error(`Error getting top 7 movies for category ${category}:`, error);
        throw error;
    }
}

async function getMovieDetails(movieId) {
    try {
        return await fetchData(`titles/${movieId}`);
    } catch (error) {
        console.error('Error getting movie details:', error);
        throw error;
    }
}

async function displayTopRatedMovie() {
    try {
        const topRatedMovieId = await getTopMovie();
        const movieDetails = await getMovieDetails(topRatedMovieId);

        document.querySelector('.best-movie__leftside__title').textContent = movieDetails.title;
        document.querySelector('.best-movie__leftside__summary').textContent = movieDetails.long_description;
        document.querySelector('.best-movie__rightside__image').src = movieDetails.image_url;
        document.querySelector('.best-movie__rightside__image').id = `${topRatedMovieId}`;
        
        document.querySelector(".best-movie__leftside__button").addEventListener("click", async function() {
            try {
                const topRatedMovieId = await getTopMovie();
                const movieDetails = await getMovieDetails(topRatedMovieId);
        
                document.getElementById("modal-image").src = movieDetails.image_url;
                document.getElementById("modal-title").textContent = `Title: ${movieDetails.title}`;
                document.getElementById("modal-genre").textContent = `Genres: ${movieDetails.genres.join(", ")}`;
                document.getElementById("modal-release-date").textContent = `Release Date: ${movieDetails.date_published}`;
                document.getElementById("modal-rated").textContent = `Rated: ${movieDetails.rated}`;
                document.getElementById("modal-imdb-score").textContent = `IMDb Score: ${movieDetails.imdb_score}`;
                document.getElementById("modal-director").textContent = `Director: ${movieDetails.directors.join(", ")}`;
                document.getElementById("modal-actors").textContent = `Actors: ${movieDetails.actors.join(", ")}`;
                document.getElementById("modal-duration").textContent = `Duration: ${movieDetails.duration} minutes`;
                document.getElementById("modal-country").textContent = `Country: ${movieDetails.countries.join(", ")}`;
                document.getElementById("modal-box-office").textContent = `Box Office: ${movieDetails.worldwide_gross_income || "N/A"}`;
                document.getElementById("modal-summary").textContent = `Summary: ${movieDetails.long_description}`;
        
                const modal = document.getElementById("modal");
                modal.style.display = "block";
            } catch (error) {
                console.error('Error displaying movie details:', error);
            }
        });
        
    } catch (error) {
        console.error('Error displaying top rated movie:', error);
    }
}


async function displayBestMovies() {
    try {
        const bestMoviesIds = await getTop7MoviesByCategory();
        const moviesImages = [];

        for (const movieId of bestMoviesIds) {
            const movieDetails = await getMovieDetails(movieId);
            moviesImages.push({ id: movieId, imageUrl: movieDetails.image_url });
            if (moviesImages.length === 7) break;
        }

        console.log("Liens des images des meilleurs films:", moviesImages);

        const carouselWrapper = document.getElementById("carousel");
        moviesImages.forEach(movie => {
            const image = document.createElement("img");
            image.classList.add("hdcarousel_item");
            image.src = movie.imageUrl;
            image.id = `${movie.id}`;
            carouselWrapper.appendChild(image);
        });
    } catch (error) {
        console.error('Error displaying best movies:', error);
    }
}

async function displayCategoryMovies() {
    try {
        const categories = ['History', 'Crime', 'Adventure'];

        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            const bestMoviesIds = await getTop7MoviesByCategory(category.toLowerCase());

            for (const movieId of bestMoviesIds) {
                const movieDetails = await getMovieDetails(movieId);
                const carouselWrapperId = `#category-${i + 1} .smoothcarousel__wrapper`;
                const carouselWrapper = document.querySelector(carouselWrapperId);
                const image = document.createElement("img");
                image.classList.add("hdcarousel_item");
                image.src = movieDetails.image_url;
                image.id = `${movieId}`;
                carouselWrapper.appendChild(image);
            }
        }
    } catch (error) {
        console.error('Error displaying category movies:', error);
    }
}

class SmoothCarousel {
    version = 0.1;
    el = null;
    items = [];
    size = 5;
    activeClass = false;
    gap = 50;
    item = { width: 0, gap: 0, left: 0 };
    lastClickTime = 0; // Ajouter cette variable pour suivre le temps du dernier clic

    constructor(el, settings = {}) {
        this.el = el;
        this.items = el.getElementsByClassName("hdcarousel_item");
        const nav = this.el.parentElement.getElementsByClassName("smoothcarousel__nav__button");
        for (let i = 0; i < nav.length; i++) {
            nav[i].addEventListener("click", () => this.handleClick(nav[i])); // Utiliser une fonction séparée pour gérer les clics
        }
        this.init();
    }

    async init() {
        await this.setMinItems();
        this.item.width = await this.getSize();
        this.el.style.height = this.items[0].clientHeight + "px";
        await this.clone("prev");
        await this.build();
    }

    async setMinItems() {
        const minItems = this.size + 2;
        if (this.items.length < minItems) {
            let itemsLength = this.items.length;
            for (let i = 0; i < itemsLength; i++) {
                let c = this.items[i].cloneNode(true);
                this.el.append(c);
            }
        }
        if (this.items.length < minItems) {
            await this.setMinItems();
        }
    }

    async getSize() {
        let w = this.el.clientWidth;
        w = w / this.size - this.gap;
        return w;
    }

    async build() {
        let l = this.item.width * -1;
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].style.width = this.item.width + "px";
            this.items[i].style.left = l + "px";
            l = l + this.item.width;
            if (i > 0) {
                l = l + this.gap;
            }
        }
        if (this.activeClass) this.setActive();
    }

    async clone(pos = "next") {
        let item = 0;
        if (pos === "next") {
            item = this.items[0];
        } else {
            item = this.items[this.items.length - 1];
        }
        let c = item.cloneNode(true);
        if (pos === "next") {
            this.el.append(c);
        } else {
            this.el.prepend(c);
        }
        item.remove();
    }

    async handleClick(el) {
        const now = new Date().getTime();
        if (now - this.lastClickTime >= 1000) { 
            this.lastClickTime = now; 
            let pos = el.getAttribute("data-dir");
            if (pos === "next") {
                this.next();
            } else {
                this.prev();
            }
        }
    }

    async next() {
        await this.clone("next");
        await carouselSetup(this.el);
        await this.build();
    }

    async prev() {
        await this.clone("prev");
        await this.build();
    }

    setActive() {
        let m = Math.round(this.size / 2);
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].classList.remove("hdcarousel_item_active");
            if (i === m) {
                this.items[i].classList.add("hdcarousel_item_active");
            }
        }
    }
}


async function carouselSetup(carousel) {
    try {
        const carouselItems = carousel.querySelectorAll(".hdcarousel_item");

        carouselItems.forEach((item) => {
            item.addEventListener("click", async () => {
                try {
                    const movieId = parseInt(item.id);
                    const movieDetails = await getMovieDetails(movieId);

                    document.getElementById("modal-image").src = movieDetails.image_url;
                    document.getElementById("modal-title").textContent = `Title: ${movieDetails.title}`;
                    document.getElementById("modal-genre").textContent = `Genres: ${movieDetails.genres.join(", ")}`;
                    document.getElementById("modal-release-date").textContent = `Release Date: ${movieDetails.date_published}`;
                    document.getElementById("modal-rated").textContent = `Rated: ${movieDetails.rated}`;
                    document.getElementById("modal-imdb-score").textContent = `IMDb Score: ${movieDetails.imdb_score}`;
                    document.getElementById("modal-director").textContent = `Director: ${movieDetails.directors.join(", ")}`;
                    document.getElementById("modal-actors").textContent = `Actors: ${movieDetails.actors.join(", ")}`;
                    document.getElementById("modal-duration").textContent = `Duration: ${movieDetails.duration} minutes`;
                    document.getElementById("modal-country").textContent = `Country: ${movieDetails.countries.join(", ")}`;
                    document.getElementById("modal-box-office").textContent = `Box Office: ${movieDetails.worldwide_gross_income || "N/A"}`;
                    document.getElementById("modal-summary").textContent = `Summary: ${movieDetails.long_description}`;

                    const modal = document.getElementById("modal");
                    modal.style.display = "block";
                } catch (error) {
                    console.error('Error displaying movie details:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error setting up carousel:', error);
    }
}

async function displayModal() {
    try {
        const carousels = document.querySelectorAll("#carousel");

        carousels.forEach(async (carousel) => {
            new SmoothCarousel(carousel);
            const closeModalButton = document.querySelector(".modal__close");

            closeModalButton.addEventListener("click", () => {
                const modal = document.getElementById("modal");
                modal.style.display = "none";
            });

            carouselSetup(carousel);
        });
    } catch (error) {
        console.error('Error displaying modal:', error);
    }
}

async function main() {
    await displayBestMovies();
    await displayCategoryMovies();
    displayTopRatedMovie();
    displayModal();
}

main();
