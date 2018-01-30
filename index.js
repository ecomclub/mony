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
      let intent = serverResponse.result.metadata.intentName
      switch (intent) {
        // RESOURCE
        case 'general':
          let required
          let count = 0
          if (serverResponse.result.parameters.resource) {
            endpoint = serverResponse.result.parameters.resource + '/schema.json'
            method = 'GET'

            // buscando o schema do resource
            sendApi(endpoint, method, function (response) {
              for (let i = 0; i < response.data.required.length; i++) {
                required.push(response.data.required[i])
                let promise = client.textRequest('Basico: ' + required[count])
                sendDialogFlow(promise)
                count++
              }
            })
          }
          break
        case 'basico-custom':
          body = {}
          body[serverResponse.result.parameters.property] = serverResponse.result.parameters.value
          if (count < required.length) {
            let promise = client.textRequest('Basico: ' + required[count])
            sendDialogFlow(promise)
            count++
          }
          break
        case 'cadastro.de.login.por.rede.social':
          // get the social media and return to dialogflow
          let redesocial = serverResponse.result.parameters.redesocial
          let promise = client.textRequest('Como criar login pelo ' + redesocial + ' ?')
          sendDialogFlow(promise)
          break
        case 'deletar produtos':
          // send a delete request to Api
          endpoint = '/products/' + serverResponse.result.parameters.id + '.json'
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
