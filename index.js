'use strict'

const client = new ApiAi.ApiAiClient({ accessToken: '639e715963e14f4e886e9fb8cee23e2d' })

var Mony = function () {
  let accessToken, myID, storeID, responseCallback, actionCallback

  let sendRequest = function (promise, callback) {
    promise
        .then(handleResponse)
        .catch(handleError)

    // response from dialofflow
    function handleResponse (serverResponse) {
      let method, body, endpoint
      // intent name
      let intent = serverResponse.metadata.intentName

      switch (intent) {
        case 'produtos.criar - name - yes - sku - yes':
          endpoint = '/products.json'
          method = 'POST'
          body = {
            'sku': serverResponse.parameters.sku,
            'name': serverResponse.parameters.name
          }
          break
        case 'cadastro.de.login.por.rede.social':
          let redesocial = serverResponse.parameters.redesocial
          let promise = client.textRequest('Como criar login pelo ' + redesocial + ' ?')
          sendRequest(promise)
          break
        // case 'editar produtos':
        //   endpoint = '/products/' + serverResponse.parameters.id + '.json'
        //   method = 'PATCH'
        //   break
        case 'deletar produtos':
          endpoint = '/products/' + serverResponse.parameters.id + '.json'
          method = 'DELETE'
          break
        // case 'perguntas produtos':
        //   method = 'GET'
        //   break
        default:
          // the answer for dialogflow
          for (var i = 0; i < serverResponse.result.fulfillment.messages.length; i++) {

          }
      }

      if (endpoint) {
        // call with AJAX
        let ajax = new XMLHttpRequest()
        let url = 'https://sandbox.e-com.plus/v1/' + endpoint
        ajax.open(method, url, true)
        ajax.setRequestHeader('X-Access-Token', accessToken)
        ajax.setRequestHeader('X-My-ID', myID)
        ajax.setRequestHeader('X-Store-ID', storeID)
        ajax.setRequestHeader('Content-Type', 'application/json')

        if (body) {
          // send JSON body
          ajax.send(JSON.stringify(body))
        } else {
          ajax.send()
        }

        ajax.onreadystatechange = function () {
          if (this.readyState === 4) {
            // request finished and response is ready
            // TREAT ERROR
            // responseCallback(serverResponse.result.fulfillment.speech)
          }
        }
      }
    }

    // Error Handling
    function handleError (serverError) {
      // change to logger
      console.log(serverError)
    }
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
      sendRequest(promise)
    },

    // function to send the actual page of the user to help the search
    'sendPage': function (page) {
      // using JS SDK from dialogflow
      let promise = client.textRequest('pagina:' + page)
      // sendRequest
      sendRequest(promise)
    },

    // function to send message from user
    'sendMessage': function (msg, callback) {
      // using JS SDK from dialogflow
      let promise = client.textRequest(msg)

      // sendRequest
      sendRequest(promise, callback)
    }
  }
}

Mony = Mony()
