'use strict'

const client = new ApiAi.ApiAiClient({ accessToken: '639e715963e14f4e886e9fb8cee23e2d' })

var Mony = function () {
  let accessToken, myID, storeID, responseCallback, actionCallback
  let count
  let body
  let method, endpoint, schema, type, property
  let sendDialogFlow = function (promise, callback) {
    promise
      .then(handleResponse)
      .catch(handleError)

    function handleResponse (serverResponse) {
        // intent name
      console.log(serverResponse)
      let intent = serverResponse.result.metadata.intentName
      switch (intent) {
        // RESOURCE
        case 'general':
          count = 0
          body = {}
          if (serverResponse.result.parameters.resource) {
            if (serverResponse.result.parameters.action === 'POST') {
              promise = client.textRequest('crie: ' + serverResponse.result.parameters.resource)
              sendDialogFlow(promise)
            } else if (serverResponse.result.parameters.action === 'DELETE') {
              promise = client.textRequest('delete ' + serverResponse.result.parameters.resource)
              sendDialogFlow(promise)
            } else if (serverResponse.result.parameters.action === 'PATCH') {
              promise = client.textRequest('editar ' + serverResponse.result.parameters.resource)
              sendDialogFlow(promise)
            }
          }
          break

        // POST RESOURCE
        case 'resource - post':
          endpoint = serverResponse.result.parameters.resource + '/schema.json'
          method = 'GET'
         // get schema resource
          sendApi(endpoint, method, body, function (response) {
            schema = response
            promise = client.textRequest('Basico: ' + schema.data.required[count])
            sendDialogFlow(promise)
          })
          break

        case 'resource - post - basico - value':
         // add required element to body
          type = typeof serverResponse.result.parameters.value
          property = false
          for (let key in schema.data.properties) {
            if (key === serverResponse.result.parameters.property) {
              property = true
              if (schema.data.properties[key].type === 'number') {
                schema.data.required[count] = parseInt(serverResponse.result.parameters.value)
              } else if (type === schema.data.properties[key].type) {
                schema.data.required[count] = serverResponse.result.parameters.value
              }
            }
          }
          if (property === false) {
            console.log('Não existe esta propriedade para este recurso')
          }
          count++
          console.log(body)
         // more required elements to add
          if (count < schema.data.required.length) {
            promise = client.textRequest('Basico: ' + schema.data.required[count])
            sendDialogFlow(promise)
          } else {
            promise = client.textRequest('propriedade extra')
            sendDialogFlow(promise)
          }
          break

        case 'resource - post - extra - no':
          endpoint = serverResponse.result.parameters.resource + '.json'
          method = 'POST'
          sendApi(endpoint, method, body, function (response) {
            responseCallback('O produto foi criado, seu id é: ' + response.data._id)
          })
          break

        case 'resource - post - extra - yes - property - value':
          type = typeof serverResponse.result.parameters.value
          property = false
          for (let key in schema.data.properties) {
            if (key === serverResponse.result.parameters.property) {
              property = true
              if (schema.data.properties[key].type === 'number') {
                body[serverResponse.result.parameters.property] = parseInt(serverResponse.result.parameters.value)
              } else if (type === schema.data.properties[key].type) {
                body[serverResponse.result.parameters.property] = serverResponse.result.parameters.value
              }
            }
          }
          if (property === false) {
            console.log('Não existe esta propriedade para este recurso')
          }
          promise = client.textRequest('propriedade extra')
          sendDialogFlow(promise)
          break

        // EDIT RESOURCE
        case 'resource - edit':
          endpoint = serverResponse.result.parameters.resource + '/schema.json'
          method = 'GET'
         // get schema resource
          sendApi(endpoint, method, body, function (response) {
            schema = response
          })
          break

        case 'edit - id - property - value':
          type = typeof serverResponse.result.parameters.value
          property = false
          for (let key in schema.data.properties) {
            if (key === serverResponse.result.parameters.property) {
              property = true
              if (schema.data.properties[key].type === 'number') {
                body[serverResponse.result.parameters.property] = parseInt(serverResponse.result.parameters.value)
              } else if (type === schema.data.properties[key].type) {
                body[serverResponse.result.parameters.property] = serverResponse.result.parameters.value
              }
            }
          }
          if (property === false) {
            console.log('Não existe esta propriedade para este recurso')
          }
          promise = client.textRequest('propriedade extra')
          sendDialogFlow(promise)
          break

        case 'edit - id - property - value - yes':
          promise = client.textRequest('id: ' + serverResponse.result.parameters.id)
          sendDialogFlow(promise)
          break

        case 'edit - id - property - value - no':
          endpoint = serverResponse.result.parameters.resource + '/' + serverResponse.result.parameters.id + '.json'
          method = 'PATCH'
          sendApi(endpoint, method, body)
          break

        // DELETE RESOURCE
        case 'delete - id':
          endpoint = serverResponse.result.parameters.resource + '/' + serverResponse.result.parameters.id + '.json'
          method = serverResponse.result.parameters.action
          sendApi(endpoint, method)
          break

        // SOCIAL MEDIA
        case 'cadastro.de.login.por.rede.social':
        // get the social media and return to dialogflow
          let redesocial = serverResponse.result.parameters.redesocial
          promise = client.textRequest('Como criar login pelo ' + redesocial + ' ?')
          sendDialogFlow(promise)
          break

        case 'login.Google - no':
          promise = client.textRequest('Como criar login pelo Google ?')
          sendDialogFlow(promise)
          break

        case 'login.WindowsLive - no':
          promise = client.textRequest('Como criar login pelo Windows Live ?')
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

  // let mapping = function (response) {
  //   switch (response) {
  //     case 'name':
  //     case 'display_name':
  //       msg = 'o nome'
  //       break
  //     case 'price':
  //       msg = 'o preço'
  //       break
  //     case 'title':
  //       msg = 'o titulo'
  //       break
  //     case 'quantity':
  //       msg = 'a quantidade'
  //       break
  //     case 'grid_id':
  //       msg = 'o id do grid'
  //       break
  //     case 'financial_email':
  //     case 'main_email':
  //       msg = 'o email'
  //       break
  //     case 'amount':
  //       msg = 'o total'
  //       break
  //     case 'app_id':
  //       msg = 'o id do aplicativo'
  //       break
  //     case 'version':
  //       msg = 'a versão'
  //       break
  //     case 'resource':
  //       msg = 'o recurso'
  //       break
  //     case 'action':
  //       msg = 'a ação'
  //       break
  //     case 'method':
  //       msg = 'o método'
  //       break
  //     case 'segment_id':
  //       msg = 'id do segmento'
  //       break
  //     case 'doc_type':
  //       msg = 'tipo de documento'
  //       break
  //     case 'doc_number':
  //       msg = 'número do documento'
  //       break
  //     case 'corporate_name':
  //       msg = 'nome da empresa'
  //       break
  //     default:
  //       msg = schema.data.required[count]
  //       break
  //   }
  //   return msg
  // }

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
