window.Mony = (function () {
  'use strict'

  // lib methods
  var methods = {}
  // response callback function
  var ResponseCallback = function (err, html) {
    (err ? console.error(err) : console.log(html))
  }
  // credentials
  // var StoreId, AccessToken, MyId

  /* global ApiAi */
  var client = new ApiAi.ApiAiClient({
    accessToken: 'YOUR_ACCESS_TOKEN'
  })

  methods.sendMessage = function (msg) {
    // send a request to Dialogflow with any text message
    client.textRequest(msg)
    .then(function (response) {
      var text = response.result.fulfillment.speech.trim()
      if (text && text !== '') {
        // parse to HTML and callback
        var html = text.replace(/(https?:[\S]+)/g, '<a href="$1" target="_blank">$1</a>')
        ResponseCallback(null, html)
      } else {
        // empty callback
        ResponseCallback()
      }
    })
    .catch(function (error) {
      ResponseCallback(error)
    })
  }

  methods.sendRoute = function (hash) {
    // mock to send current admin panel route (page)
    // eg.: "$route:/#/home"
    methods.sendMessage('$route:/' + hash)
  }

  methods.init = function (params, accessToken, responseCallback) {
    // init conversation on Dialogflow setting up some parameters
    var paramsList = [ 'storeId', 'storeName', 'domain', 'name', 'gender', 'email', 'myId', 'lang', 'hour' ]
    var msg = ''
    params = params || {}
    // send current local hour
    params.hour = new Date().getHours()
    for (var i = 0; i < paramsList.length; i++) {
      var param = paramsList[i]
      msg += '$' + param + ':"' + (params[param] || '') + '" '
    }
    // send the first message and set the response callback function
    methods.sendMessage(msg)
    if (typeof response === 'function') {
      ResponseCallback = responseCallback
    }
  }

  /* global jQuery */
  if (typeof jQuery === 'function') {
    // autosync current route with mony
    jQuery(window).on('hashchange', function () {
      methods.sendRoute(window.location.hash)
    })
  }

  return methods
}())
