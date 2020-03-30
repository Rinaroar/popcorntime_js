  // DECLARATIONS

  // Register and login
  const apiUrl = 'https://kebabtv.dwsapp.io/api';

  // Search form
  const searchForm = document.querySelector('form');
  const searchData = document.querySelector('[name="searchData"]'); // selecteur de balise HTML

  // Display movies
  const theMoviedbURL = 'https://api.themoviedb.org/3/search/movie?api_key=d458c20e1abcc9417413972af9541834&language=en-US&query=';
  const movieList = document.querySelector('#movieList');
  const moviePopin = document.querySelector('#moviePopin article');

  //Display Favorite Added Popin
  const favoritePopin = document.querySelector('#favoritePopin article')

  const registerButton = document.getElementById('registerButton');
  const loginButton = document.getElementById('loginButton');


  // FONCTIONS

  // Dynamics diplays

  const displaySearch = () => {
    document.getElementById('displaySearchSection').classList.remove('hidden');
    document.getElementById('popcorn').classList.remove('hidden');
    document.getElementById('movieList').classList.add('hidden');
    document.getElementById('favoritesList').classList.add('hidden');
  };

  const displayFavButton = () => {
    document.getElementById('favoritesList').classList.remove('hidden');
    document.getElementById('displaySearchSection').classList.add('hidden');
    userAccount();
  };

  const displayRegisterForm = () => {
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');

    loginButton.style.borderBottom='none';
    loginButton.style.color='rgb(161, 161, 161)';

    registerButton.style.borderBottom='solid';
    registerButton.style.color='#3C66B1'
  };

  const displayLoginForm = () => {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerAdded').classList.remove('show');
    document.getElementById('registerAdded').classList.add('hidden');

    loginButton.style.color='#3C66B1'
    loginButton.style.borderBottom='solid';

    registerButton.style.borderBottom='none';
    registerButton.style.color='rgb(161, 161, 161)';
  };


  // REGISTER AND LOGIN

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
      .then( userRegistered() )
      .catch( jsonError => console.log(jsonError))
    })
  };

  const userRegistered = () => {
    registerAdded.innerHTML += `
    <img src="./images/tick.png"/>
    <p> You've been well registered.<br/><span>Please log you in to access your session</span></p>
    `;
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('registerAdded').classList.add('show');
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
        Welcome(jsonData);
        userAccount();
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
        document.getElementById('formConnexion').classList.add('hidden');
        document.getElementById('button-nav').classList.remove('hidden');
        document.getElementById('displaySearchSection').classList.remove('hidden');
        if(document.getElementById('favoritesList').className != 'hidden') {
          displayFav(jsonData);
        }
      })
      .catch( jsonError => console.log(jsonError))
  };

  const Welcome = (userData) => {
    welcome.innerHTML += `
    <h2>Welcome ${userData.data.user.pseudo}</h2>
    `;
  };

  // SEARCH MOVIES
  const getSearchSubmit = () => {
    document.getElementById('displaySearchSection').addEventListener('submit', (event) => { // fonction de callback
      event.preventDefault();
      document.getElementById('movieList').classList.remove('hidden');

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
      let imagePath = '';

      if (collection[i].poster_path !== null) {
        imagePath = 'https://image.tmdb.org/t/p/w500/' + collection[i].poster_path;
      } else {
        imagePath = './images/film.png';
      }

      movieList.innerHTML += `
        <article>
          <figure>
            <img src="${imagePath}" alt="${collection[i].original_title}">
            <figcaption movie-id="${collection[i].id}">${collection[i].original_title}<span class="seeMore"> (See more...)<span></figcaption>
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
      document.getElementById('popcorn').classList.add('hidden');
    };

  const getPopinLink = (linkCollection) => {
    for (let link of linkCollection) {
      link.addEventListener('click', () => {
        //+var = parseInt(var) || parseFloat(var)
        searchMovie(+link.getAttribute('movie-id'));
      });
    };
  };

  // DISPLAY POPIN
  const displayPopin = (data) => {
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
    document.querySelector('#addFav').addEventListener('click', () => {
      addFavorite(document.querySelector('#addFav'), data);
    })

    document.querySelector('#closeButton').addEventListener('click', () => {
      closePopin(document.querySelector('#closeButton'));
    })
  };

  const closePopin = (button) => {
      button.parentElement.parentElement.parentElement.classList.remove('open');
  };

  // FAVORITES : ADD AND DELETE
  const addFavorite = (button, data) => {
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
      .then( jsonData => favAdded(jsonData))
      .catch( jsonError => console.log(jsonError))
      closePopin(button);
  };

  const favAdded = (userData) => {
    favoritePopin.innerHTML = `
        <img src="./images/tick.png"/>
        <p>You've just added <span>${userData.data.data.title}</span> to your favorite</p>
    `;
    setTimeout(() => {
      favoritePopin.parentElement.classList.add('open');
    }, 600)
    setTimeout(() => {
      favoritePopin.parentElement.classList.remove('open');
      }, 2500)
  };

  const displayFav = collection => {
    favoritesUl.innerHTML = '';

    for (let i=0; i < collection.data.favorite.length; i++){
      favoritesUl.innerHTML += `
          <div>
            <li>${collection.data.favorite[i].title}
            <button movie-id="${collection.data.favorite[i]._id}" class="favButton"><i class="fas fa-trash"></i></button>
            </li>
          </div>
      `;
      for (let button of document.querySelectorAll('.favButton')) {
        button.addEventListener('click', () => {
          deleteFavorite(button.getAttribute('movie-id'));
        })
      };
    }
    document.getElementById('displaySearchSection').classList.add('hidden');
  };

  const deleteFavorite = (movieId) => {
    new FETCHrequest(
      apiUrl + '/favorite/' + movieId,
      'DELETE',
      {
        token: localStorage.getItem('token')
      }
    )
    .sendRequest()
    .then( jsonData => console.log(jsonData))
    .catch( jsonError => console.log(jsonError))
    setTimeout(() => {
      userAccount();
      }, 500)
  };


  // Attendre le chargement du DOM
  document.addEventListener('DOMContentLoaded', () => {

  // Lancer IHM
  if(localStorage.getItem('token') !== null){
    // Récupérer info user avec le token
    userAccount();
  }
  else{
    // Afficher les formulaires
    document.querySelector('#registerForm').classList.remove('hidden');
    document.querySelector('#loginForm').classList.remove('hidden');
    displayLoginForm();
  }

  getSearchSubmit();
  registerUser('#registerForm', '#registerForm [name="userEmail"]', '#registerForm [name="userPassword"]', '#registerForm [name="userPseudo"]');
  login('#loginForm', '#loginForm [name="loginEmail"]', '#loginForm [name="loginPassword"]');
  })


// fonction de callback = fonction qui se delenche à la fin d'une autre fonction
// après la => si enleve les {} = return implicite
// jsonData est un param, peut mettre un autre mot = c'est la reponse en json de response.ok
// movie-id est mon propre attribut html que j'ai crée pour recup l'ID du movie
