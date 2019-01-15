window.Mony = (function () {
  'use strict'

  // lib methods
  var methods = {}
  // debug option state
  var Debug
  // response callback function
  var ResponseCallback = function (err, html) {
    if (err) {
      console.error(err)
    } else {
      console.info(html)
    }
  }
  // credentials
  // var StoreId, AccessToken, MyId

  /* global ApiAi */
  var client = new ApiAi.ApiAiClient({
    accessToken: '38e90080662a4340a3d67ae31b91a86c'
  })

  methods.sendMessage = function (msg) {
    // send a request to Dialogflow with any text message
    client.textRequest(msg)

    // successful response handler
    .then(function (response) {
      if (Debug) {
        console.info(response)
      }
      var res = response.result.fulfillment
      var text = (res.messages && res.messages.length ? res.messages[0] : res).speech.trim()
      if (text && text !== '') {
        // parse to HTML and callback
        var html = text.replace(/(https?:[\S]+)/g, '<a href="$1" target="_blank">$1</a>')
        // split message for each double line break
        var parts = html.split('\n\n')
        for (var i = 0; i < parts.length; i++) {
          ResponseCallback(null, parts[i].replace(/\n/g, '<br>'))
        }
      } else {
        // empty callback
        ResponseCallback()
      }
    })

    // Dialogflow server error handler
    .catch(function (error) {
      if (Debug) {
        console.info(error)
      }
      ResponseCallback(error)
    })
  }

  methods.sendRoute = function (hash) {
    // mock to send current admin panel route (page)
    if (typeof hash === 'string' && hash.slice(0, 2) === '#/') {
      // eg.: "/#/home"
      methods.sendMessage('/' + hash)
    }
  }

  var updateRoute = function () {
    // send current URL hash
    methods.sendRoute(window.location.hash)
  }

  methods.init = function (params, accessToken, responseCallback, debug) {
    // set global callback function and debug option
    if (typeof responseCallback === 'function') {
      ResponseCallback = responseCallback
    }
    Debug = debug
    if (Debug) {
      console.info('debugging Mony responses')
    }

    // init conversation on Dialogflow setting up some parameters
    var paramsList = [ 'name', 'gender', 'email', 'hour', 'language' ]
    var msg = ''
    params = params || {}
    // send current local hour
    params.hour = new Date().getHours()

    // mount message with received params
    for (var i = 0; i < paramsList.length; i++) {
      var param = paramsList[i]
      var val
      switch (typeof params[param]) {
        case 'string':
          // does not accept strings with spaces
          val = params[param].split(' ')[0]
          if (val === '') {
            val = '-'
          }
          break
        case 'number':
          val = params[param]
          break
        default:
          val = '-'
      }
      msg += param + ' ' + val + ' '
    }
    // send the first message
    methods.sendMessage(msg)

    // save current dashboard route (URL)
    updateRoute()
    // setup Store ID if defined
    if (params.storeId) {
      setTimeout(function () {
        methods.sendMessage('1#storeId ' + params.storeId)
      }, 600)
    }
  }

  /* global jQuery */
  if (typeof jQuery === 'function') {
    // autosync current route with mony
    jQuery(window).on('hashchange', updateRoute)
  }

  return methods
}())
