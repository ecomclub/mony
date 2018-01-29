'use strict'

const client = new ApiAi.ApiAiClient({ accessToken: '639e715963e14f4e886e9fb8cee23e2d' })

var Mony = function () {
  let accessToken, myID, storeID, responseCallback, actionCallback

  let sendDialogFlow = function (promise, callback) {
    let method, body, endpoint
    promise
        .then(handleResponse)
        .catch(handleError)

    function handleResponse (serverResponse) {
      // intent name
      let intent = serverResponse.metadata.intentName

      switch (intent) {
        // RESOURCE
        case 'general':
          if (serverResponse.parameters.resource) {
            endpoint = '/' + serverResponse.parameters.resource + '/schema.json'
            method = 'GET'
            // callback = function (response) {
            //   let msg = 'Me passe as seguintes propriedades: '
            //   for (let i = 0; i < response.required; i++) {
            //     msg += response.required[i]
            //   }
            //   let promise = client.textRequest(msg)
            //   sendDialogFlow(promise)
            // }
            // buscando o schema do resource
            sendApi(endpoint, method, body, callback)
          }
          break
        case 'cadastro.de.login.por.rede.social':
          // get the social media and return to dialogflow
          let redesocial = serverResponse.parameters.redesocial
          let promise = client.textRequest('Como criar login pelo ' + redesocial + ' ?')
          sendDialogFlow(promise)
          break
        case 'deletar produtos':
          // send a delete request to Api
          endpoint = '/products/' + serverResponse.parameters.id + '.json'
          method = 'DELETE'
          sendApi(endpoint, body, method)
          break
        default:
          // response from dialogflow
          for (let i = 0; i < serverResponse.result.fulfillment.message.length; i++) {
            responseCallback(serverResponse.result.fulfillment.message[i])
          }
      }
    }
    // Error Handling
    function handleError (serverError) {
      // change to logger
      console.log(serverError)
    }
  }

  let sendApi = function (endpoint, method, body, callback) {
    // using axios for HTTPS request
    let url = 'https://sandbox.e-com.plus/v1/' + endpoint
    let config = {
      method: method,
      url: url,
      headers: {
        'X-Access-Token': accessToken,
        'X-My-ID': myID,
        'X-Store-ID': storeID,
        'Content-Type': 'application/json'
      }
    }
    if (body) {
      config.data = body
    }

    axios(config)
    .then(function (response) {
      callback(response)
    })
    .catch(function (error) {
      console.log(error)
    })
  }

  return {

    // function to init conversation on dialogflow with some parameters
    'init': function (storeid, storeName, domain, name, gender, email, userID, language, token, id, ResponseCallback, ActionCallback) {
      // set token and id to authentication requests
      accessToken = token
      myID = id
      storeID = storeid

      // msg
      responseCallback = ResponseCallback
      // object
      actionCallback = ActionCallback

      // using JS SDK from dialogflow
      let promise = client.textRequest('O id: ' + storeID + ' nome da loja: ' + storeName + ' dominio: ' + domain +
      ' nome: ' + name + ' gênero: ' + gender + ' email: ' + email + ' id do usuário: ' + userID + ' linguagem: ' + language)

      // sendRequest
      sendDialogFlow(promise)
    },

    // function to send the actual page of the user to help the search
    'sendPage': function (page) {
      // using JS SDK from dialogflow
      let promise = client.textRequest('pagina:' + page)
      // treatMessage
      sendDialogFlow(promise)
    },

    // function to send message from user
    'sendMessage': function (msg, callback) {
      // using JS SDK from dialogflow
      let promise = client.textRequest(msg)

      // treatMessage
      sendDialogFlow(promise, callback)
    }
  }
}

Mony = Mony()
