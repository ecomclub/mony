'use strict'

const client = new ApiAi.ApiAiClient({ accessToken: '639e715963e14f4e886e9fb8cee23e2d' })

var Mony = function () {
  let accessToken, myID, storeID, responseCallback, actionCallback
  let count
  let body
  let method, endpoint, schema
  let sendDialogFlow = function (promise, callback) {
    promise
      .then(handleResponse)
      .catch(handleError)

    function handleResponse (serverResponse) {
       // intent name
      console.log(serverResponse.result.fulfillment.speech)
      let intent = serverResponse.result.metadata.intentName
      switch (intent) {
        // RESOURCE
        case 'general':
          count = 0
          body = {}
          if (serverResponse.result.parameters.resource) {
            endpoint = serverResponse.result.parameters.resource + '/schema.json'
            method = 'GET'
            // get schema resource
            sendApi(endpoint, method, body, function (response) {
              schema = response
              promise = client.textRequest('Basico: ' + schema.data.required[count])
              count++
              sendDialogFlow(promise)
            })
          }
          break

        case 'basico - custom':
          // add required element to body
          body[serverResponse.result.parameters.property] = serverResponse.result.parameters.value
          // more required elements to add
          if (count < schema.data.required.length) {
            promise = client.textRequest('Basico: ' + schema.data.required[count])
            sendDialogFlow(promise)
            count++
          } else {
            promise = client.textRequest('propriedade extra')
            sendDialogFlow(promise)
          }
          break

        case 'extra - no':
          // send body to Api
          console.log(body)
          endpoint = serverResponse.result.parameters.resource + '.json'
          method = serverResponse.result.parameters.action
          sendApi(endpoint, method, body)
          break

        case 'extra - yes - custom - custom':
          if (serverResponse.result.parameters.property === 'price') {
            body[serverResponse.result.parameters.property] = parseInt(serverResponse.result.parameters.value)
          }

          promise = client.textRequest('propriedade extra')
          sendDialogFlow(promise)
          break

        case 'cadastro.de.login.por.rede.social':
        // get the social media and return to dialogflow
          let redesocial = serverResponse.result.parameters.redesocial
          promise = client.textRequest('Como criar login pelo ' + redesocial + ' ?')
          sendDialogFlow(promise)
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
    console.log(url)
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

    if (typeof body === 'object') {
      config.data = body
    }

    axios(config)
    .then(function (response) {
      /* endpoint = '' */
      if (callback) {
        callback(response)
      } else {
        console.log(response)
      }
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
