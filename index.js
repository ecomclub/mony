'use strict'

var isNodeJs = false
// Verify if the script is Node JS
if (typeof module !== 'undefined' && module.exports) {
  isNodeJs = true
}

/* global ApiAi */
const client = new ApiAi.ApiAiClient({ accessToken: '639e715963e14f4e886e9fb8cee23e2d' })

var Mony = function () {
  let accessToken, myID, storeID, responseCallback, actionCallback, https, count, body, method, endpoint, schema, type, property, action, logger
  let keywords
  let size = 0
  let url
  let bool = false

  if (isNodeJs) {
    https = require('https')
  }

  let sendDialogFlow = function (promise, callback) {
    promise
      .then(handleResponse)
      .catch(handleError)

    function handleResponse (serverResponse) {
        // intent name
      console.log(serverResponse)
      let intent = serverResponse.result.metadata.intentName
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
              // verify the type of the property
              for (let key in schema.data.properties) {
                if (schema.data.required[count] === key) {
                  if (schema.data.properties[key].type !== 'object') {
                    promise = client.textRequest('Basico: ' + schema.data.required[count])
                    sendDialogFlow(promise)
                  } else {
                    action = {
                      'link': 'pagina de criação do resource'
                    }
                    actionCallback(action)
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
           // more required elements to add
            if (count < schema.data.required.length) {
              for (let key in schema.data.properties) {
                if (schema.data.required[count] === key) {
                  if (schema.data.properties[key].type !== 'object') {
                    promise = client.textRequest('Basico: ' + schema.data.required[count])
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
            sendApi(endpoint, method, body, function (response) {
              responseCallback('O' + serverResponse.result.parameters.resource + 'foi criado, seu id é: ' + response.data._id)
            })
            break

          // add extra property to body
          case 'resource - post - extra - yes - property - value':
            type = typeof serverResponse.result.parameters.value
            property = false
            for (let key in schema.data.properties) {
              if (key === serverResponse.result.parameters.property) {
                property = true
                // if the value of the property is number, parse the response value of dialogflow
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

          // add property to body
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

          // id do recurso para editar
          case 'edit - id - property - value - yes':
            promise = client.textRequest('id: ' + serverResponse.result.parameters.id)
            sendDialogFlow(promise)
            break

          // send edit to api
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
            console.log('111111')
            url += serverResponse.result.parameters.keyword + '&q='
            if (size > 0) {
              size--
              promise = client.textRequest('keyword: ' + keywords[size])
              sendDialogFlow(promise)
            } else {
              url = url.slice(0, -3)
              console.log(url)
              let config = {
                method: 'GET',
                url: url,
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              }
                          /* global axios */
              axios(config)
              .then(function (response) {
                /* endpoint = '' */
                if (callback) {
                  for (var key in response.posts) {
                    if (response.posts.hasOwnProperty(key)) {
                      // link
                      responseCallback('https://meta.discourse.org/t/' + response.posts[key].id)
                    }
                  }
                } else {
                  console.log(response)
                }
              })
              .catch(function (error) {
                console.log(error)
              })
            }
            break
          default:
          // response from dialogflow
            for (let i = 0; i < serverResponse.result.fulfillment.message.length; i++) {
              responseCallback(serverResponse.result.fulfillment.message[i])
            }
        }
      } else {
        // none intent was triggered
        // verify if keywords already exits
        if (bool === false) {
          bool = true
          let str = serverResponse.result.resolvedQuery
          keywords = str.split(' ')
          for (var i = 0; i < keywords.length; i++) {
            if (keywords[i] !== '' || keywords[i] !== ' ' || keywords[i] !== '?') {
              size++
            }
          }
          // do the first request
          size--
          url = 'https://meta.discourse.org/search.json?q='
          promise = client.textRequest('keyword: ' + keywords[size])
          sendDialogFlow(promise)
        } else {
          if (size > 0) {
            size--
            promise = client.textRequest('keyword: ' + keywords[size])
            sendDialogFlow(promise)
          } else {
            // remove the last 3 letters '&q='
            url = url.slice(0, -3)
            console.log(url)
            let config = {
              method: 'GET',
              url: url,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }

            /* global axios */
            // do the request
            axios(config)
            .then(function (response) {
              /* endpoint = '' */
              if (callback) {
                for (var key in response.posts) {
                  if (response.posts.hasOwnProperty(key)) {
                    // link
                    responseCallback('https://meta.discourse.org/t/' + response.posts[key].id)
                  }
                }
              } else {
                console.log(response)
              }
            })
            .catch(function (error) {
              console.log(error)
            })
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

  let sendApi = function (endpoint, method, body, callback) {
  // using axios for HTTPS request
    let host = 'api.e-com.plus'
    let path = '/v1'
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

    if (isNodeJs) {
      // call with NodeJS http module
      let options = {
        hostname: host,
        path: path,
        method: method,
        headers: {
          'X-Access-Token': accessToken,
          'X-My-ID': myID,
          'X-Store-ID': storeID,
          'Content-Type': 'application/json'
        }
      }

      let req = https.request(options, function (res) {
        let rawData = ''
        res.setEncoding('utf8')
        res.on('data', function (chunk) {
          // buffer
          rawData += chunk
        })
        res.on('end', function () {
          // treat response
          response(res.statusCode, rawData, callback)
        })
      })

      req.on('error', function (err) {
        console.error(err)
        // callback with null body
        callback(err, null)
      })

      if (body) {
        // send JSON body
        req.write(JSON.stringify(body))
      }
      req.end()
    } else {
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
  }

  let response = function (status, data, callback) {
    // treat request response
    let body
    try {
      // expecting valid JSON response body
      body = JSON.parse(data)
    } catch (err) {
      logger.error(err)
      // callback with null body
      callback(err, null)
      return
    }

    if (status === 200) {
      // err null
      callback(null, body)
    } else {
      let msg
      if (body.hasOwnProperty('message')) {
        msg = body.message
      } else {
        // probably an error response from Graphs or Search API
        // not handling Neo4j and Elasticsearch errors
        msg = 'Unknown error, see response objet to more info'
      }
      errorHandling(callback, msg, body)
    }
  }

  let errorHandling = function (callback, errMsg, responseBody) {
    if (typeof callback === 'function') {
      let err = new Error(errMsg)
      if (responseBody === undefined) {
        // body null when error occurs before send API request
        callback(err, null)
      } else {
        callback(err, responseBody)
      }
    }
    logger.log(errMsg)
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

if (isNodeJs) {
  module.exports = Mony
}
