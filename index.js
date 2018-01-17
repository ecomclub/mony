'use strict'

const client = new ApiAi.ApiAiClient({accessToken: '30c7f830268c4d06ab53c3cb04c18213'})

// function to init conversation
function init (storeID, storeName, domain, name, gender, email, userID, language) {
  // msg with storeID and name, dialogflowKey with accessToken to dialogflow

  // using JS SDK from dialogflow
  const promise = client.textRequest('O id: ' + storeID + ' nome da loja: ' + storeName + ' dominio: ' + domain +
  ' nome: ' + name + ' gênero: ' + gender + ' email: ' + email + ' id do usuário: ' + userID + ' linguagem: ' + language)

  promise
      .then(handleResponse)
      .catch(handleError)

  // response from dialofflow
  function handleResponse (serverResponse) {
    console.log(serverResponse)
  }

  // Error Handling
  function handleError (serverError) {
    // change to logger
    console.log(serverError)
  }
}

// function to send the actual page of the user to help the search
function sendPage (page) {
  const promise = client.textRequest('pagina:' + page)

  promise
      .then(handleResponse)
      .catch(handleError)

  // response from dialofflow
  function handleResponse (serverResponse) {
    console.log(serverResponse)
  }

  // Error Handling
  function handleError (serverError) {
    // change to logger
    console.log(serverError)
  }
}

// function to send message from user
function sendMessage (msg) {
  const promise = client.textRequest(msg)

  promise
      .then(handleResponse)
      .catch(handleError)

  // response from dialofflows
  function handleResponse (serverResponse) {
    console.log(serverResponse)
  }

  // Error Handling
  function handleError (serverError) {
    // change to logger
    console.log(serverError)
  }
}
