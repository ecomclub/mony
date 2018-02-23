window.Mony = (function () {
  'use strict'

  /* global ApiAi */
  var client = new ApiAi.ApiAiClient({ accessToken: '639e715963e14f4e886e9fb8cee23e2d' })

  // credentials
  var accessToken, myID, storeID, responseCallback, actionCallback
  // request
  var method, endpoint, body, url
  // type the property to compare in post requests
  var type
  // variable to verify in post if the property is in the resource or not
  var property
  // count to required properties
  var count
  var schema, action
  // array of keywords
  var keywords
  // number of keywords
  var size = 0
  // variable to verify if the keyword alreay exists
  var bool = false

  var sendDialogFlow = function (promise, callback) {
    promise.then(handleResponse).catch(handleError)

    function handleResponse (serverResponse) {
      // intent name
      var intent = serverResponse.result.metadata.intentName
      if (intent) {
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
                promise = client.textRequest('deletar: ' + serverResponse.result.parameters.resource)
                sendDialogFlow(promise)
              } else if (serverResponse.result.parameters.action === 'PATCH') {
                promise = client.textRequest('editar: ' + serverResponse.result.parameters.resource)
                sendDialogFlow(promise)
              }
            }
            break

          // POST RESOURCE
          case 'resource - post':
            endpoint = serverResponse.result.parameters.resource + '/schema.json'
            method = 'GET'
           // get schema resource
            sendApi(endpoint, method, body, function (err, response) {
              if (!err) {
                schema = response
                // verify the type of the property
                for (var key in schema.properties) {
                  if (schema.required[count] === key) {
                    if (schema.properties[key].type !== 'object') {
                      promise = client.textRequest('Basico: ' + schema.required[count])
                      sendDialogFlow(promise)
                    } else {
                      action = {
                        'link': 'pagina de criação do resource'
                      }
                      actionCallback(action)
                    }
                  }
                }
              }
            })
            break

          // add required properties to body
          case 'resource - post - basico - value':
           // add required element to body
            type = typeof serverResponse.result.parameters.value
            property = false
            // verify the type of the property
            for (var key in schema.properties) {
              if (key === serverResponse.result.parameters.property) {
                property = true
                if (schema.properties[key].type === 'number') {
                  body[schema.required[count]] = parseInt(serverResponse.result.parameters.value)
                } else if (type === schema.properties[key].type) {
                  body[schema.required[count]] = serverResponse.result.parameters.value
                }
              }
            }
            if (property === false) {
              console.log('Não existe esta propriedade para este recurso')
            }
            count++
           // more required elements to add
            if (count < schema.required.length) {
              for (var key2 in schema.properties) {
                if (schema.required[count] === key2) {
                  if (schema.properties[key2].type !== 'object') {
                    promise = client.textRequest('Basico: ' + schema.required[count])
                    sendDialogFlow(promise)
                  }
                }
              }
            } else {
              // verify if more properties will be add
              promise = client.textRequest('propriedade extra')
              sendDialogFlow(promise)
            }
            break

          // send post to api
          case 'resource - post - extra - no':
            endpoint = serverResponse.result.parameters.resource + '.json'
            method = 'POST'
            console.log(body)
            sendApi(endpoint, method, body, function (err, response) {
              console.log(response)
              if (!err) {
                var msg = 'O' + serverResponse.result.parameters.resource +
                  'foi criado, seu id é: ' + response._id
                responseCallback(msg)
              }
            })
            break

          // add extra property to body
          case 'resource - post - extra - yes - property - value':
            type = typeof serverResponse.result.parameters.value
            property = false
            for (var key3 in schema.data.properties) {
              if (key3 === serverResponse.result.parameters.property) {
                property = true
                // if the value of the property is number, parse the response value of dialogflow
                if (schema.properties[key3].type === 'number') {
                  body[serverResponse.result.parameters.property] = parseInt(serverResponse.result.parameters.value)
                } else if (type === schema.properties[key3].type) {
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
            sendApi(endpoint, method, body, function (err, response) {
              if (!err) {
                schema = response
              }
            })
            break

          // add property to body
          case 'edit - id - property - value':
            type = typeof serverResponse.result.parameters.value
            property = false
            for (var key4 in schema.properties) {
              if (key4 === serverResponse.result.parameters.property) {
                property = true
                if (schema.properties[key4].type === 'number') {
                  body[serverResponse.result.parameters.property] = parseInt(serverResponse.result.parameters.value)
                } else if (type === schema.properties[key4].type) {
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

          // id do recurso para editar
          case 'edit - id - property - value - yes':
            promise = client.textRequest('id: ' + serverResponse.result.parameters.id)
            sendDialogFlow(promise)
            break

          // send edit to api
          case 'edit - id - property - value - no':
            endpoint = serverResponse.result.parameters.resource + '/' +
              serverResponse.result.parameters.id + '.json'
            method = 'PATCH'
            sendApi(endpoint, method, body)
            break

          // DELETE RESOURCE
          case 'delete - id':
            endpoint = serverResponse.result.parameters.resource + '/' +
              serverResponse.result.parameters.id + '.json'
            method = serverResponse.result.parameters.action
            sendApi(endpoint, method)
            break

          // SOCIAL MEDIA
          case 'cadastro.de.login.por.rede.social':
          // get the social media and return to dialogflow
            var redesocial = serverResponse.result.parameters.RedeSocial
            promise = client.textRequest('Como criar login pelo ' + redesocial + ' ?')
            sendDialogFlow(promise)
            break

          // resend the tutorial to client
          case 'login.Google - no':
            promise = client.textRequest('Como criar login pelo Google ?')
            sendDialogFlow(promise)
            break

          // resend the tutorial to client
          case 'login.WindowsLive - no':
            promise = client.textRequest('Como criar login pelo Windows Live ?')
            sendDialogFlow(promise)
            break

          // discuss
          case 'keywords':
            // url to search
            url += serverResponse.result.parameters.keyword + '&q='
            if (size > 0) {
              size--
              promise = client.textRequest('keyword: ' + keywords[size])
              sendDialogFlow(promise)
            } else {
              url = url.slice(0, -3)
              console.log(url)

              /* global $ */
              $.ajax({
                method: 'GET',
                url: url,
                dataType: 'json'
              })
              .then(function (response) {
                /* endpoint = '' */
                if (callback) {
                  for (var key5 in response.posts) {
                    if (response.posts.hasOwnProperty(key5)) {
                      // link
                      responseCallback('https://community.e-com.plus/t/' + response.posts[key5].id)
                    }
                  }
                } else {
                  console.log(response)
                }
              })
            }
            break

          default:
            // response from dialogflow
            responseCallback(serverResponse.result.fulfillment.speech)
            // if (serverResponse.result.fulfillment.messages.length > 1) {
            //   for (var i = 0; i < serverResponse.result.fulfillment.messages.length; i++) {
            //     callback(serverResponse.result.fulfillment.messages[i].speech)
            //   }
            // } else {
            //   /* callback */
            //   callback(serverResponse.result.fulfillment.speech)
            // }
        }
      } else {
        // none intent was triggered
        // verify if keywords already exits
        if (bool === false) {
          bool = true
          var str = serverResponse.result.resolvedQuery
          keywords = str.split(' ')
          for (var y = 0; y < keywords.length; y++) {
            if (keywords[y] !== '' || keywords[y] !== ' ' || keywords[y] !== '?') {
              size++
            }
          }
          // do the first request
          size--
          url = 'https://community.e-com.plus/search.json?q='
          promise = client.textRequest('keyword: ' + keywords[size])
          sendDialogFlow(promise)
        } else {
          if (size > 0) {
            size--
            promise = client.textRequest('keyword: ' + keywords[size])
            sendDialogFlow(promise)
          } else {
            // remove the last 3 varters '&q='
            url = url.slice(0, -3)
            console.log(url)

            /* global $ */
            $.ajax({
              method: 'GET',
              url: url,
              dataType: 'json'
            })
            .done(function (response) {
              /* endpoint = '' */
              if (callback) {
                for (var key6 in response.posts) {
                  if (response.posts.hasOwnProperty(key6)) {
                    // link
                    responseCallback('Acesse o link: ' + 'https://community.e-com.plus/t/' + response.topics[key6].id)
                  }
                }
              } else {
                console.log(response)
              }
            })
          }
        }
      }
    }

    // Error Handling
    function handleError (serverError) {
      // @TODO
      console.log(serverError)
    }
  }

  var sendApi = function (endpoint, method, body, callback) {
    // using jQuery.ajax for HTTPS request
    // console.log(url)
    var config = {
      method: method,
      url: 'https://api.e-com.plus/v1/' + endpoint,
      dataType: 'json',
      headers: {
        'X-Access-Token': accessToken,
        'X-My-ID': myID,
        'X-Store-ID': storeID
      }
    }
    console.log(config.headers)
    if (typeof body === 'object') {
      config.data = JSON.stringify(body)
    }

    // global $
    var ajax = $.ajax(config)

    ajax.done(function (json) {
      /* endpoint = '' */
      if (typeof callback === 'function') {
        // err null
        callback(null, json)
      } else {
        console.log(json)
      }
    })

    ajax.fail(function (jqXHR, textStatus, err) {
      var msg
      if (body.hasOwnProperty('message')) {
        msg = body.message
      } else {
        // probably an error response from Graphs or Search API
        // not handling Neo4j and Elasticsearch errors
        msg = 'Unknown error, see response objet to more info'
      }
      errorHandling(callback, msg, jqXHR.responseJSON)
    })
  }

  var errorHandling = function (callback, errMsg, responseBody) {
    if (typeof callback === 'function') {
      var err = new Error(errMsg)
      console.log(responseBody)
      if (responseBody === undefined) {
        // body null when error occurs before send API request
        callback(err, null)
      } else {
        callback(err, responseBody)
      }
    }
    console.log(errMsg)
  }

  return {
    // function to init conversation on dialogflow with some parameters
    'init': function (storeid, storeName, domain, name, gender, email, userID, language, token, id,
      ResponseCallback, ActionCallback) {
      // set token and id to authentication requests
      accessToken = token
      myID = id
      storeID = storeid

      // msg
      responseCallback = ResponseCallback
      // object
      actionCallback = ActionCallback

      // using JS SDK from dialogflow
      var msg = 'O id: ' + storeID + ' nome da loja: ' + storeName + ' dominio: ' + domain +
        ' nome: ' + name + ' gênero: ' + gender + ' email: ' + email +
        ' id do usuário: ' + userID + ' linguagem: ' + language
      var promise = client.textRequest(msg)

      // sendRequest
      sendDialogFlow(promise)
    },

    // function to send the actual page of the user to help the search
    'sendPage': function (page) {
      // using JS SDK from dialogflow
      var promise = client.textRequest('pagina:' + page)
      // treatMessage
      sendDialogFlow(promise)
    },

    // function to send message from user
    'sendMessage': function (msg, callback) {
      // using JS SDK from dialogflow
      var promise = client.textRequest(msg)

      // treatMessage
      sendDialogFlow(promise, callback)
    }
  }
}())
