/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict'

var helpers = require('../helpers'),
    UsergridRequest = require('./request'),
    UsergridAuth = require('./auth'),
    UsergridAppAuth = require('./appAuth'),
    _ = require('lodash')

var defaultOptions = {
    baseUrl: 'https://api.usergrid.com',
    authMode: UsergridAuth.AUTH_MODE_USER
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

    Object.defineProperty(self, 'test', {
        enumerable: false
    })

    Object.defineProperty(self, 'clientId', {
        enumerable: false
    })

    Object.defineProperty(self, 'clientSecret', {
        enumerable: false
    })

    Object.defineProperty(self, 'appAuth', {
        get: function() {
            return __appAuth
        },
        set: function(options) {
            if (options instanceof UsergridAppAuth) {
                __appAuth = options
            } else if( _.isUndefined(options) ) {
                __appAuth = undefined
            } else {
                __appAuth = new UsergridAppAuth(options)
            }
        }
    })

    // if client ID and secret are defined on initialization, initialize appAuth
    if (self.clientId && self.clientSecret) {
        self.setAppAuth(self.clientId, self.clientSecret)
    }
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
    setAppAuth: function() {
        this.appAuth = new UsergridAppAuth(helpers.args(arguments))
    },
    authenticateApp: function(options) {
        var self = this
        var callback = helpers.cb(helpers.args(arguments))
        // console.log(self.appAuth)//, self.appAuth, new UsergridAppAuth(options), new UsergridAppAuth(self.clientId, self.clientSecret))
        var auth = _.first([options, self.appAuth, new UsergridAppAuth(options), new UsergridAppAuth(self.clientId, self.clientSecret)].filter(function(p) {
            return p instanceof UsergridAppAuth
        }))

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
        var args = helpers.args(arguments)
        var callback = helpers.cb(args)
        var setAsCurrentUser = (_.last(args.filter(_.isBoolean))) !== undefined ? _.last(args.filter(_.isBoolean)) : true
        var UsergridUser = require('./user')
        var currentUser = new UsergridUser(options)
        currentUser.login(self, function(error, usergridResponse, token) {
            if (usergridResponse.ok && setAsCurrentUser) {
                self.currentUser = currentUser
            }
            callback(error, usergridResponse, token)
        })
    },
    usingAuth: function(auth) {
        this.tempAuth = helpers.client.configureTempAuth(auth)
        return this
    }
}

module.exports = UsergridClient
Object.defineProperty(module.exports, 'Connections', {
    enumerable: false,
    writable: true,
    configurable: true
})
module.exports.Connections = {}
Object.defineProperty(module.exports.Connections, 'DIRECTION_IN', {
    enumerable: false,
    get: function() { return "IN" }
})
Object.defineProperty(module.exports.Connections, 'DIRECTION_OUT', {
    enumerable: false,
    get: function() { return "OUT" }
})