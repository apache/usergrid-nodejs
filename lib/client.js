'use strict'

var UsergridRequest = require('./request'),
    request = require('request'),
    ok = require('objectkit'),
    config = require('../config.json'),
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

    if (arguments.length === 2) {
        self.orgId = arguments[0]
        self.appId = arguments[1]
    } 

    _.defaults(self, options, ok(config).getIfExists('usergrid'), defaultOptions)

    if (!self.orgId || !self.appId) {
        throw new Error('"orgId" and "appId" parameters are required when instantiating UsergridClient')
    }
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

Object.defineProperty(UsergridClient.prototype, 'appAuth', {
    get: function() {
        return this._appAuth
    },
    set: function(options) {
        var self = this
        if (options.length === 3) {
            self._appAuth = new UsergridAppAuth(options)
        } else if (options[0] instanceof UsergridAppAuth) {
            self._appAuth = options[0]
        } else if (options instanceof UsergridAppAuth) {
            self._appAuth = options
        } else if (ok(options[0]).has('clientId')) {
            self._appAuth = new UsergridAppAuth({
                clientId: options[0].clientId,
                clientSecret: options[0].clientSecret,
                tokenTtl: options[0].tokenTtl || 3600
            })
        }
    }
})

UsergridClient.prototype.setAppAuth = function() {
    this.appAuth = _.values(arguments)
}

UsergridClient.prototype.authenticateApp = function(options, callback) {
    var self = this
    callback = helpers.cb(callback || options)
    if (!(self.appAuth instanceof UsergridAppAuth)) {
        throw new Error('App auth context was not defined when attempting to call .authenticateApp()')
    }
    options.type = 'token'
    options.client = self
    request({
        uri: helpers.buildUrl(options),
        headers: helpers.userAgent,
        body: {
            grant_type: 'client_credentials',
            client_id: options.clientId || self.appAuth.clientId,
            client_secret: options.clientSecret || self.appAuth.clientSecret
        },
        method: 'POST',
        json: true
    }, function(error, response, body) {
        var token = body.access_token || undefined
        self.appAuth.token = token
        self.appAuth.expiry = Date.now() + ((body.expires_in ? body.expires_in - 5 : 0) * 1000)
        callback(error, response, token)
    })
}

module.exports = UsergridClient