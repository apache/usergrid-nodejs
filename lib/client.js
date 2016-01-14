'use strict'

var helpers = require('../helpers'),
    UsergridRequest = require('./request'),
    UsergridResponse = require('./response'),
    UsergridResponseError = require('./responseError'),
    UsergridAuth = require('./auth'),
    UsergridAppAuth = require('./appAuth'),
    UsergridUserAuth = require('./userAuth'),
    _ = require('lodash')

var defaultOptions = {
    baseUrl: 'https://api.usergrid.com',
    authFallback: UsergridAuth.AuthFallback.NONE
}

var UsergridClient = function(options) {
    var self = this

    var __appAuth
    self.tempAuth = undefined
    self.isSharedInstance = false

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
        return new UsergridRequest(helpers.build.GET(this, helpers.args(arguments)))
    },
    PUT: function() {
        return new UsergridRequest(helpers.build.PUT(this, helpers.args(arguments)))
    },
    POST: function() {
        return new UsergridRequest(helpers.build.POST(this, helpers.args(arguments)))
    },
    DELETE: function() {
        return new UsergridRequest(helpers.build.DELETE(this, helpers.args(arguments)))
    },
    connect: function() {
        return new UsergridRequest(helpers.build.connection(this, 'POST', helpers.args(arguments)))
    },
    disconnect: function() {
        return new UsergridRequest(helpers.build.connection(this, 'DELETE', helpers.args(arguments)))
    },
    getConnections: function() {        
        return new UsergridRequest(helpers.build.getConnections(this, helpers.args(arguments)))
    },
    setAppAuth: function(options) {
        this.appAuth = (_.isString(options)) ? helpers.args(arguments) : options
    },
    authenticateApp: function(options) {
        var self = this
        var callback = helpers.cb(helpers.args(arguments))
        var auth = (options instanceof UsergridAppAuth) ? options : self.appAuth || new UsergridAppAuth(options)

        if (!(auth instanceof UsergridAppAuth)) {
            throw new Error('App auth context was not defined when attempting to call .authenticateApp()')
        } else if (!auth.clientId || !auth.clientSecret) {
            throw new Error('authenticateApp() failed because clientId or clientSecret are missing')
        }

        return new UsergridRequest({
            client: self,
            path: 'token',
            method: 'POST',
            body: helpers.build.appLoginBody(auth)
        }, function(error, usergridResponse, body) {
            if (usergridResponse.ok) {
                if (!self.appAuth) {
                    self.appAuth = auth
                }
                self.appAuth.token = body.access_token
                self.appAuth.expiry = helpers.time.expiry(body.expires_in)
                self.appAuth.tokenTtl = body.expires_in
            }
            callback(error, usergridResponse, body.access_token)
        })
    },
    authenticateUser: function(options) {
        var self = this
        var callback = helpers.cb(helpers.args(arguments))

        var UsergridUser = require('./user')
        var currentUser = new UsergridUser(options)
        currentUser.login(self, function(error, usergridResponse, token) {
            if (usergridResponse.ok) {
                self.currentUser = currentUser
            }
            callback(error, usergridResponse, token)
        })
    },
    usingAuth: function(auth) {
        if (auth instanceof UsergridAuth) {
            this.tempAuth = auth
        }
        return this
    }
}

module.exports = UsergridClient
module.exports.Connections = {
    DIRECTION_IN: "IN",
    DIRECTION_OUT: "OUT"
}