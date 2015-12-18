'use strict'

var UsergridRequest = require('./request'),
    request = require('request'),
    helpers = require('../helpers'),
    UsergridResponse = require('./response'),
    UsergridAppAuth = require('./appAuth'),
    UsergridUserAuth = require('./userAuth'),
    UsergridUser = require('./user'),
    _ = require('lodash')

var AuthFallback = {
    APP: 'APP',
    NONE: 'NONE',
}

var defaultOptions = {
    baseUrl: 'https://api.usergrid.com',
    authFallback: AuthFallback.NONE,
    paginationPreloadPages: 0, // number of pages to preload
    paginationCacheTimeout: 300 * 1000, // default: 300 seconds
    paginationCursors: [] // array of pagination cursors
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
            } else if (options !== undefined) {
                __appAuth = new UsergridAppAuth(options)
            }
        }
    })
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
    connections: {
        DIRECTION_IN: "IN",
        DIRECTION_OUT: "OUT"
    },
    connect: function() {
        var options = helpers.build.connection(this, Array.prototype.slice.call(arguments))
        request({
            uri: options.uri,
            headers: helpers.userAgent,
            method: 'POST',
            json: true
        }, function(error, response) {
            var usergridResponse = new UsergridResponse(response)
            options.callback(error, usergridResponse, usergridResponse.entities)
        })
    },
    disconnect: function(options, callback) {
        var options = helpers.build.connection(this, Array.prototype.slice.call(arguments))
        request({
            uri: options.uri,
            headers: helpers.userAgent,
            method: 'DELETE',
            json: true
        }, function(error, response) {
            var usergridResponse = new UsergridResponse(response)
            options.callback(error, usergridResponse, usergridResponse.entities)
        })
    },
    getConnections: function(options, callback) {
        var options = helpers.build.getConnections(this, Array.prototype.slice.call(arguments))
        request({
            uri: options.uri,
            headers: helpers.userAgent,
            method: 'GET',
            json: true
        }, function(error, response) {
            var usergridResponse = new UsergridResponse(response)
            options.callback(error, usergridResponse, usergridResponse.entities)
        })
    },
    setAppAuth: function(options) {
        this.appAuth = (typeof options === 'string') ? _.values(arguments) : options
    },
    authenticateApp: function(options, callback) {
        var self = this
        callback = helpers.cb(callback || options)

        options = (options instanceof UsergridAppAuth) ? options : self.appAuth || new UsergridAppAuth(options)

        if (!(options instanceof UsergridAppAuth)) {
            throw new Error('App auth context was not defined when attempting to call .authenticateApp()')
        } else if (!options.clientId || !options.clientSecret) {
            throw new Error('authenticateApp() failed because clientId or clientSecret are missing')
        }

        options.type = 'token'
        options.client = self
        request({
            uri: helpers.build.url(options),
            headers: helpers.userAgent,
            body: {
                grant_type: 'client_credentials',
                client_id: options.clientId,
                client_secret: options.clientSecret
            },
            method: 'POST',
            json: true
        }, function(error, response, body) {
            if (self.appAuth && response.statusCode === 200) {
                self.appAuth.token = body.access_token
                self.appAuth.expiry = helpers.time.expiry(body.expires_in)
                self.appAuth.tokenTtl = body.expires_in
            }
            callback(error, response, body.access_token)
        })
    },
    authenticateUser: function(options, callback) {
        var self = this
        callback = helpers.cb(callback || options)

        if (!options.username && !options.email && !options.password) {
            throw new Error('authenticateUser() failed because username/email and password are missing')
        } else if (!options.password) {
            throw new Error('authenticateUser() failed because password is missing')
        }

        options.type = 'token'
        options.client = self
        request({
            uri: helpers.build.url(options),
            headers: helpers.userAgent,
            body: options.username ? {
                grant_type: 'password',
                username: options.username,
                password: options.password
            } : {
                grant_type: 'password',
                email: options.email,
                password: options.password
            },
            method: 'POST',
            json: true
        }, function(error, response, body) {
            if (response.statusCode === 200) {
                self.currentUser = new UsergridUser(body.user)
                self.currentUser.auth = new UsergridUserAuth(body.user)
                self.currentUser.auth.token = body.access_token
                self.currentUser.auth.expiry = helpers.time.expiry(body.expires_in)
                self.currentUser.auth.tokenTtl = body.expires_in
            }
            callback(error, response, body.access_token)
        })
    }
}

module.exports = UsergridClient