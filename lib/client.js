'use strict'

var UsergridRequest = require('./request'),
    ok = require('objectkit'),
    config = require('../config.json').config,
    helpers = require('../helpers'),
    UsergridAuth = require('./auth'),
    UsergridAppAuth = require('./appAuth'),
    url = require('url'),
    _ = require('underscore')

var UsergridClient = function(opts) {
    var self = this

    // required properties
    self.orgId = ok(arguments).getIfExists('0') || ok(opts).getIfExists('orgId') || ok(config).getIfExists('usergrid.orgId')
    self.appId = ok(arguments).getIfExists('1') || ok(opts).getIfExists('appId') || ok(config).getIfExists('usergrid.appId')

    // optional initializer properites
    self.baseUrl = ok(opts).getIfExists('baseUrl') || ok(config).getIfExists('usergrid.baseUrl') || "https://api.usergrid.com" // default: https://api.usergrid.com
    self.clientId = ok(opts).getIfExists('clientId') || ok(config).getIfExists('usergrid.clientId') || "" // default: undefined
    self.clientSecret = ok(opts).getIfExists('clientSecret') || ok(config).getIfExists('usergrid.clientSecret') || "" // default: undefined
    self.tokenTtl = ok(opts).getIfExists('tokenTtl') || ok(config).getIfExists('usergrid.tokenTtl') || 3600 // time in seconds, default:  3600
    self.authFallback = ok(opts).getIfExists('authFallback') || ok(config).getIfExists('usergrid.authFallback') || "none" // ("none"|"app") default: "none"

    // optional post-init properties
    self.paginationPreloadPages = 0 // number of pages to preload
    self.paginationCacheTimeout = 300 * 1000 // default: 300 seconds
    self.paginationCursors = [] // array of pagination cursors

    if (self.orgId !== undefined && self.appId !== undefined) {
        return self;
    } else {
        throw new Error('\'orgId\' and \'appId\' parameters are required when instantiating UsergridClient')
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
    if (typeof uuidOrName !== 'string')
        throw new Error('\'uuidOrName\' parameter is required when making a PUT request')
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
    if (typeof uuidOrName !== 'string')
        throw new Error('\'uuidOrName\' parameter is required when making a DELETE request')
    return new UsergridRequest({
        client: this,
        method: 'DELETE',
        type: type,
        uuidOrName: typeof uuidOrName === 'string' ? uuidOrName : undefined
    }, callback || uuidOrName)
}

Object.defineProperty(UsergridClient.prototype, "appAuth", {
    get: function() {
        return this._appAuth
    },
    set: function(opts) {
        var self = this
        if (opts.length === 3) {
            self._appAuth = new UsergridAppAuth(opts)
        } else if (opts[0] instanceof UsergridAppAuth) {
            self._appAuth = opts[0]
        } else if (ok(opts[0]).has('clientId')) {
            self._appAuth = new UsergridAppAuth({
                clientId: opts[0].clientId,
                clientSecret: opts[0].clientSecret,
                tokenTtl: opts[0].tokenTtl || 3600
            })
        }
    }
})

UsergridClient.prototype.setAppAuth = function() {
    this.appAuth = _.values(arguments)
}

UsergridClient.prototype.authenticateApp = function(opts, callback) {
    callback = callback || opts
    if (opts instanceof UsergridAuth) {
        self.appAuth.accessToken = 'bob'
    }
}

module.exports = UsergridClient