'use strict'

const client = new ApiAi.ApiAiClient({accessToken: '639e715963e14f4e886e9fb8cee23e2d'})

var Mony = function () {
  let accessToken, myID, responseCallback, actionCallback

  let sendRequest = function (promise, callback) {
    promise
        .then(handleResponse)
        .catch(handleError)

    // response from dialofflow
    function handleResponse (serverResponse) {
      let method, body
      let parameters = serverResponse.result.parameters

      // loop in parameters object
      for (var key in parameters) {
        if (parameters.hasOwnProperty(key) && key === 'Questions') {}
      }

      // call with AJAX
      let ajax = new XMLHttpRequest()
      let url = 'https://api.e-com.plus/v1'
      ajax.open(method, url, true)
      ajax.setRequestHeader('X-Access-Token', accessToken)
      ajax.setRequestHeader('X-My-ID', myID)

      if (body) {
        // send JSON body
        ajax.send(JSON.stringify(body))
      } else {
        ajax.send()
      }

      ajax.onreadystatechange = function () {
        if (this.readyState === 4) {
          // request finished and response is ready
          if (this.status !== 200) {
            // try to resend request
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
    'init': function (storeID, storeName, domain, name, gender, email, userID, language, token, id, ResponseCallback, ActionCallback) {
      // set token and id to authentication requests
      accessToken = token
      myID = id

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
