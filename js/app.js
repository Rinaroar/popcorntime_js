  // DECLARATIONS

    // Register and login
    const apiUrl = 'https://kebabtv.dwsapp.io/api';
    const mainNav = document.querySelector('header nav');

    // Search form
    const searchForm = document.querySelector('header form');
    const searchLabel = document.querySelector('header form span');
    const searchData = document.querySelector('[name="searchData"]'); // selecteur de balise HTML

    // Display movies
    const theMoviedbURL = 'https://api.themoviedb.org/3/search/movie?api_key=d458c20e1abcc9417413972af9541834&language=en-US&query=';
    const movieList = document.querySelector('#movieList');
    const moviePopin = document.querySelector('#moviePopin article');



  // FONCTIONS

    const registerUser = (formTag, emailTag, passwordTag, pseudoTag) => {
      // capter le formulaire
      document.querySelector(formTag).addEventListener('submit', event => {
        event.preventDefault();

        new FETCHrequest(
          apiUrl + '/register',
          'POST',
          {
            email: document.querySelector(emailTag).value,
            password: document.querySelector(passwordTag).value,
            pseudo: document.querySelector(pseudoTag).value
          }
        )
        .sendRequest()
        .then( jsonData => console.log(jsonData))
        .catch( jsonError => console.log(jsonError))
      })
    };

    const login = (formTag, emailTag, passwordTag) => {
      // capter le formulaire
      document.querySelector(formTag).addEventListener('submit', event => {
        event.preventDefault();

        new FETCHrequest(
          apiUrl + '/login',
          'POST',
          {
            email: document.querySelector(emailTag).value,
            password: document.querySelector(passwordTag).value,
          }
        )
        .sendRequest()
        .then( jsonData => {
          localStorage.setItem("token", jsonData.data.token);
          console.log(jsonData.data.token);
        })
        .catch( jsonError => console.log(jsonError))
      })
    };

    const userAccount = () => {
        new FETCHrequest(
          apiUrl + '/me',
          'POST',
          { token: localStorage.getItem('token') }
        )
        .sendRequest()
        .then( jsonData => {
          // Masquer les formulaires
          document.querySelector('#registerForm').classList.add('hidden');
          document.querySelector('#loginForm').classList.add('hidden');
          console.log(jsonData)
        })
        .catch( jsonError => console.log(jsonError))
    };


    // SEARCH MOVIES
    const getSearchSubmit = () => {
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
              <figcaption movie-id="${collection[i].id}">${collection[i].original_title} <span class="seeMore">(See more...)<span></figcaption>
            </figure>
            <div class="overview">
              <div>
                <p>${collection[i].overview}</p>
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
            <button id="addFav">Add in Favorites</button>
            <button id="closeButton">Close</button>
          </div>
        `;

        moviePopin.parentElement.classList.add('open');
        addFavorite(document.querySelector('#addFav'), data);

        closePopin(document.querySelector('#closeButton'));
      };

      // ADD FAVORITES

      const addFavorite = (button, data) => {
        button.addEventListener('click', () => {

          new FETCHrequest(
            apiUrl + '/favorite',
            'POST',
            {
              id: data.id,
              title: data.original_title,
              token: localStorage.getItem('token')
            }
          )
          .sendRequest()
          .then( jsonData => console.log(jsonData))
          .catch( jsonError => console.log(jsonError))
        })
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


    // Attendre le chargement du DOM
    document.addEventListener('DOMContentLoaded', () => {

    // Lancer IHM

    if(localStorage.getItem('token') !== null){
      // Récupérer info user avec l'user_id
      userAccount();
    }
    else{
      // Afficher les formulaires
      document.querySelector('#registerForm').classList.remove('hidden');
      document.querySelector('#loginForm').classList.remove('hidden');
    }

    getSearchSubmit();

    registerUser('#registerForm', '#registerForm [name="userEmail"]', '#registerForm [name="userPassword"]', '#registerForm [name="userPseudo"]');

    login('#loginForm', '#loginForm [name="loginEmail"]', '#loginForm [name="loginPassword"]');

  })


// fonction de callback = fonction qui se delenche à la fin d'une autre fonction
// après la => si enleve les {} = return implicite
// jsonData est un param, peut mettre un autre mot = c'est la reponse en json de response.ok
// movie-id est mon propre attribut html que j'ai crée pour recup l'ID du movie