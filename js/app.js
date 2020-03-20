
// Attendre le chargement du DOM
document.addEventListener('DOMContentLoaded', () => {

  // DECLARATIONS

    // Register and login
    const apiUrl = 'https://api.dwsapp.io';
    const mainNav = document.querySelector('header nav');
    const registerForm = document.querySelector('#registerForm');
    const userEmail = document.querySelector('[name="userEmail"]');
    const userPassword = document.querySelector('[name="userPassword"]');
    const userPseudo = document.querySelector('[name="userPseudo"]');

    // Search form
    const searchForm = document.querySelector('header form');
    const searchLabel = document.querySelector('header form span');
    const searchData = document.querySelector('[name="searchData"]'); // selecteur de balise HTML

    // Display movies
    const theMoviedbURL = 'https://api.themoviedb.org/3/search/movie?api_key=d458c20e1abcc9417413972af9541834&language=en-US&query=';
    const movieList = document.querySelector('#movieList');
    const moviePopin = document.querySelector('#moviePopin article');



  // FONCTIONS


    /* const registerUser = () => {
      registerForm.addEventListener('submit', event => {
        event.preventDefault();

        // Check form data
        let registerError = 0;

        if(userEmail.value.length < 5) {
          registerError++;
        }
        if(userPassword.value.length < 5){
          registerError++;
        }
        if(userPseudo.value.length < 2){
          registerError++;
        }

        registerError != 0
          ? fetchForm(registerForm.value)
          : displayError();
      })
    };
 */

    // SEARCH MOVIES

    const getFormSubmit = () => {
      searchForm.addEventListener('submit', (event) => { // fonction de callback
        event.preventDefault(); // plus de soumission du form pour recuperer les données en js,

        // Check the form data
        searchData.value.length > 1
        ? searchMovie(searchData.value) //valeur de l'input avec keywords + peut aussi add autre numero de page (en param)
        : displayError(searchData, 'Minimum 1 caractère !'); //parametre de la fonction displayError
      })
    };

    const displayError = (tag, msg) => {
      searchLabel.textContent = msg;
      tag.addEventListener('focus', () => searchLabel.textContent = '');
      //on capte le focus, enlève le texte d'erreur
    };

    const searchMovie = (keywords, index = 1) => {

      let fetchUrl = null;

      typeof keywords === 'number'
      ? fetchUrl = `https://api.themoviedb.org/3/movie/${keywords}?api_key=d458c20e1abcc9417413972af9541834`
      : fetchUrl = theMoviedbURL + keywords + '&page=' + index

      fetch( fetchUrl )
      .then( response => response.ok ? response.json() : 'Response not OK')
      .then( jsonData => {
        typeof keywords === 'number'
        ? displayPopin(jsonData)
        : displayMovieList(jsonData.results)
      })
      .catch(err => console.error(err));
    };


    // DISPLAY MOVIES

    const displayMovieList = collection => {
      searchData.value = '';
      movieList.innerHTML = '';

      for (let i = 0; i < collection.length; i++){
        movieList.innerHTML += `
        <article>
          <figure>
            <img src="https://image.tmdb.org/t/p/w500/${collection[i].poster_path}" alt="${collection[i].original_title}">
            <figcaption movie-id="${collection[i].id}">${collection[i].original_title} (Voir plus...)</figcaption>
          </figure>
          <div class="overview">
            <div>
              <p>${collection[i].overview}</p>
              <button> Voir le film </button>
            </div>
          </div>
        </article>
        `;
      };

      getPopinLink(document.querySelectorAll('figcaption'));
    };

      const getPopinLink = (linkCollection) => {
        for (let link of linkCollection){
          link.addEventListener('click', () => {
            //+var = parseInt(var) || parseFloat(var)
            searchMovie(+link.getAttribute('movie-id'));
          });
        };
      };

      const displayPopin = (data) => {
        console.log(data);
        moviePopin.innerHTML = `
          <div>
            <img src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="${data.original_title}">
          </div>

          <div>
            <h2>${data.original_title}</h2>
            <p>${data.overview}</p>
            <button> Voir en streaming </button>
            <button id="closeButton"> Close</button>
          </div>
        `;

        moviePopin.parentElement.classList.add('open');
        closePopin(document.querySelector('#closeButton'));
      };

      const closePopin = (button) => {
        button.addEventListener('click', () => {
          button.parentElement.parentElement.parentElement.classList.add('close'); // remonte parents div>article>section
          setTimeout( () => {
            button.parentElement.parentElement.parentElement.classList.remove('open');
            button.parentElement.parentElement.parentElement.classList.remove('close');
          }, 300)
        })
      }

    // Lancer IHM

    getFormSubmit();
    //registerUser();
});


// fonction de callback = fonction qui se delenche à la fin d'une autre fonction
// après la => si enleve les {} = return implicite
// jsonData est un param, peut mettre un autre mot = c'est la reponse en json de response.ok
// movie-id est mon propre attribut html que j'ai crée pour recup l'ID du movie