class FETCHrequest {

  constructor(url, requestType, data = null) {
      this.url = url;
      this.requestType = requestType;
      this.data = data;

      // Définition du header de la requête
      this.fetchOptions = {
          method: requestType,
          headers: {
              'Content-Type': 'application/json'
          }
      };

      // Ajouter les données dans les requêtes POST et PUT
      if( this.requestType === 'POST' || this.requestType === 'PUT' || this.requestType === 'DELETE'){
          this.fetchOptions.body = JSON.stringify(data);
      };
  }


  sendRequest(){
      return new Promise( (resolve, reject) => {
          fetch( this.url, this.fetchOptions )
          .then( fetchResponse => {
              // Vérifier le status de la requête
              if( fetchResponse.ok ){
                  // Extraire les données JSON de la réponse
                  return fetchResponse.json();
              }
              else{
                  return fetchResponse.json()
                  .then( message => reject(message) )
              };
          })
          .then( jsonData => resolve(jsonData))
          .catch( jsonError => reject(jsonError));
      })
  }
}


/* // APP
new FETCHrequest(`https://api.themoviedb.org/3/search/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&query=alien&page=1`, 'GET')
.fetch()
.then( jsonData => {
console.log(jsonData)
})
.catch( jsonError => {
console.log(jsonError)
}) */