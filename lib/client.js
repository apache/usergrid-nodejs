'use strict'

var UsergridRequest = require('./request'),
    request = require('request'),
    helpers = require('../helpers'),
    UsergridResponse = require('./response'),
    UsergridResponseError = require('./responseError'),
    UsergridAuth = require('./auth'),
    UsergridAppAuth = require('./appAuth'),
    UsergridUserAuth = require('./userAuth'),
    _ = require('lodash')

console.log(UsergridAuth.AuthFallback)
var defaultOptions = {
    baseUrl: 'https://api.usergrid.com',
    authFallback: UsergridAuth.AuthFallback.NONE
}

var UsergridClient = function(options) {
    var self = this

    var __appAuth

    if (arguments.length === 2) {
        self.orgId = arguments[0]
        self.appId = arguments[1]
    }

    _.defaults(self, options, helpers.config, defaultOptions)

    if (!self.orgId || !self.appId) {
        throw new Error('"orgId" and "appId" parameters are required when instantiating UsergridClient')
    }

    Object.defineProperty(self, 'appAuth', {
        get: function() {
            return __appAuth
        },
        set: function(options) {
            if (options instanceof UsergridAppAuth) {
                __appAuth = options
            } else if (typeof options !== "undefined") {
                __appAuth = new UsergridAppAuth(options)
            }
        }
    })

    Object.defineProperty(self, 'test', {
        enumerable: false
    })

    return self
}

UsergridClient.prototype = {
    GET: function() {
        return new UsergridRequest(helpers.build.GET(this, Array.prototype.slice.call(arguments)))
    },
    PUT: function() {
        return new UsergridRequest(helpers.build.PUT(this, Array.prototype.slice.call(arguments)))
    },
    POST: function() {
        return new UsergridRequest(helpers.build.POST(this, Array.prototype.slice.call(arguments)))
    },
    DELETE: function() {
        return new UsergridRequest(helpers.build.DELETE(this, Array.prototype.slice.call(arguments)))
    },
    connect: function() {
        var Usergrid = require('../usergrid')
        if (this === Usergrid && !Usergrid.isInitialized) {
            throw new Error('The Usergrid shared instance has not been initialized')
        }
        var options = helpers.build.connection(this, Array.prototype.slice.call(arguments))
        request({
            uri: options.uri,
            headers: helpers.build.headers(this),
            method: 'POST',
            json: true
        }, function(error, response) {
            var usergridResponse = new UsergridResponse(response)
            options.callback(error || usergridResponse.error, usergridResponse, usergridResponse.entities)
        })
    },
    disconnect: function() {
        var options = helpers.build.connection(this, Array.prototype.slice.call(arguments))
        request({
            uri: options.uri,
            headers: helpers.build.headers(this),
            method: 'DELETE',
            json: true
        }, function(error, response) {
            var usergridResponse = new UsergridResponse(response)
            options.callback(error || usergridResponse.error, usergridResponse, usergridResponse.entities)
        })
    },
    getConnections: function() {
        var options = helpers.build.getConnections(this, Array.prototype.slice.call(arguments))
        request({
            uri: options.uri,
            headers: helpers.build.headers(this),
            method: 'GET',
            json: true
        }, function(error, response) {
            var usergridResponse = new UsergridResponse(response)
            options.callback(error || usergridResponse.error, usergridResponse, usergridResponse.entities)
        })
    },
    setAppAuth: function(options) {
        this.appAuth = (typeof options === 'string') ? Array.prototype.slice.call(arguments) : options
    },
    authenticateApp: function(options, callback) {
        var self = this
        callback = helpers.cb(callback || options)

        var auth = (options instanceof UsergridAppAuth) ? options : self.appAuth || new UsergridAppAuth(options)

        if (!(auth instanceof UsergridAppAuth)) {
            throw new Error('App auth context was not defined when attempting to call .authenticateApp()')
        } else if (!auth.clientId || !auth.clientSecret) {
            throw new Error('authenticateApp() failed because clientId or clientSecret are missing')
        }

        auth.type = 'token'

        request({
            uri: helpers.build.url(self, auth),
            headers: helpers.build.headers(self),
            body: helpers.build.appLoginBody(auth),
            method: 'POST',
            json: true
        }, function(error, response, body) {
            if (response.statusCode === 200) {
                if (!self.appAuth) {
                    self.appAuth = auth
                }
                self.appAuth.token = body.access_token
                self.appAuth.expiry = helpers.time.expiry(body.expires_in)
                self.appAuth.tokenTtl = body.expires_in
            } else {
                error = new UsergridResponseError(response.body)
            }
            callback(error, response, body.access_token)
        })
    },
    authenticateUser: function(options, callback) {
        var self = this
        callback = helpers.cb(callback || options)

        var UsergridUser = require('./user')
        var currentUser = new UsergridUser(options)
        currentUser.login(self, function(error, response, token) {
            if (response.statusCode === 200) {
                self.currentUser = currentUser
            }
            callback(error, response, token)
        })
    }
}

module.exports = UsergridClient
module.exports.Connections = {
    DIRECTION_IN: "IN",
    DIRECTION_OUT: "OUT"
}