'use strict'

var UsergridRequest = require('./request'),
    request = require('request'),
    config = require('../helpers/config'),
    helpers = require('../helpers'),
    UsergridAppAuth = require('./appAuth'),
    _ = require('underscore')

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

    _.defaults(self, options, config, defaultOptions)

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
            } else {
                __appAuth = new UsergridAppAuth(options)
            }
        }
    })
}

UsergridClient.prototype.GET = function(type, uuidOrName, callback) {
    return new UsergridRequest({
        client: this,
        method: 'GET',
        type: type,
        uuidOrName: typeof uuidOrName === 'string' ? uuidOrName : undefined
    }, callback || uuidOrName)
}

UsergridClient.prototype.PUT = function(type, uuidOrName, body, callback) {
    if (typeof uuidOrName !== 'string') {
        throw new Error('"uuidOrName" parameter is required when making a PUT request')
    }
    return new UsergridRequest({
        client: this,
        method: 'PUT',
        type: type,
        uuidOrName: typeof uuidOrName === 'string' ? uuidOrName : undefined,
        body: typeof body === 'object' ? body : typeof uuidOrName === 'object' ? uuidOrName : undefined
    }, callback || body || uuidOrName)
}

UsergridClient.prototype.POST = function(type, uuidOrName, body, callback) {
    return new UsergridRequest({
        client: this,
        method: 'POST',
        type: type,
        uuidOrName: typeof uuidOrName === 'string' ? uuidOrName : undefined,
        body: typeof body === 'object' ? body : typeof uuidOrName === 'object' ? uuidOrName : undefined
    }, callback || body || uuidOrName)
}

UsergridClient.prototype.DELETE = function(type, uuidOrName, callback) {
    if (typeof uuidOrName !== 'string') {
        throw new Error('"uuidOrName" parameter is required when making a DELETE request')
    }
    return new UsergridRequest({
        client: this,
        method: 'DELETE',
        type: type,
        uuidOrName: typeof uuidOrName === 'string' ? uuidOrName : undefined
    }, callback || uuidOrName)
}

UsergridClient.prototype.setAppAuth = function(options) {
    this.appAuth = (typeof options === 'string') ? _.values(arguments) : options
}

UsergridClient.prototype.authenticateApp = function(options, callback) {
    var self = this
    callback = helpers.cb(callback || options)

    options.clientId = options.clientId || self.appAuth.clientId
    options.clientSecret = options.clientSecret || self.appAuth.clientSecret

    if (!(self.appAuth instanceof UsergridAppAuth)) {
        throw new Error('App auth context was not defined when attempting to call .authenticateApp()')
    } else if (!options.clientId || !options.clientSecret) {
        throw new Error('authenticateApp() failed because clientId or clientSecret are missing')
    }
    options.type = 'token'
    options.client = self
    request({
        uri: helpers.buildUrl(options),
        headers: helpers.userAgent,
        body: {
            grant_type: 'client_credentials',
            client_id: options.clientId,
            client_secret: options.clientSecret
        },
        method: 'POST',
        json: true
    }, function(error, response, body) {
        self.appAuth.token = body.access_token
        self.appAuth.expiry = Date.now() + ((body.expires_in ? body.expires_in - 5 : 0) * 1000)
        self.appAuth.tokenTtl = body.expires_in
        callback(error, response, body.access_token)
    })
}

module.exports = UsergridClient