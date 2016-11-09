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

var UsergridEntity = require('./entity'),
    UsergridQuery = require('./query'),
    UsergridUserAuth = require('./userAuth'),
    UsergridRequest = require('./request'),
    UsergridClient = require('../lib/client'),
    helpers = require('../helpers'),
    util = require('util'),
    _ = require('lodash')

var UsergridUser = function(obj) {

    if (!_.has(obj,'email') && !_.has(obj,'username')) {
        // This is not a user entity
        throw new Error('"email" or "username" property is required when initializing a UsergridUser object')
    }

    var self = this
    self.type = "user"

    _.assign(self, obj, UsergridEntity)
    UsergridEntity.call(self, self)

    helpers.setWritable(self, 'name')
    return self
}

var CheckAvailable = function() {
    var self = this
    var args = helpers.args(arguments)
    var client = helpers.client.validate(args)
    if (args[0] instanceof UsergridClient) {
        args.shift()
    }
    var callback = helpers.cb(args)
    var checkQuery

    if (args[0].username && args[0].email) {
        checkQuery = new UsergridQuery('users').eq('username', args[0].username).or.eq('email', args[0].email)
    } else if (args[0].username) {
        checkQuery = new UsergridQuery('users').eq('username', args[0].username)
    } else if (args[0].email) {
        checkQuery = new UsergridQuery('users').eq('email', args[0].email)
    } else {
        throw new Error("'username' or 'email' property is required when checking for available users")
    }

    client.GET(checkQuery, function(error, usergridResponse) {
        callback(error, usergridResponse, (usergridResponse.entities.length > 0))
    }.bind(self))
}

UsergridUser.prototype = {
    create: function() {
        var self = this
        var args = helpers.args(arguments)
        var client = helpers.client.validate(args)
        var callback = helpers.cb(args)
        client.POST(self, function(error, usergridResponse) {
            delete self.password
            _.assign(self, usergridResponse.user)
            callback(error, usergridResponse, usergridResponse.user)
        }.bind(self))
    },
    login: function() {
        var self = this
        var args = helpers.args(arguments)
        var callback = helpers.cb(args)
        return new UsergridRequest({
            client: helpers.client.validate(args),
            path: 'token',
            method: 'POST',
            body: helpers.build.userLoginBody(self)
        }, function(error, usergridResponse, body) {
            delete self.password
            if (usergridResponse.ok) {
                self.auth = new UsergridUserAuth(body.user)
                self.auth.token = body.access_token
                self.auth.expiry = helpers.time.expiry(body.expires_in)
                self.auth.tokenTtl = body.expires_in
            }
            callback(error, usergridResponse, body.access_token)
        })
    },
    logout: function() {
        var self = this
        var args = helpers.args(arguments)
        var callback = helpers.cb(args)
        if (!self.auth || !self.auth.isValid) {
            return callback({
                name: 'no_valid_token',
                description: 'this user does not have a valid token'
            })
        }

        var revokeAll = _.first(args.filter(_.isBoolean)) || false

        return new UsergridRequest({
            client: helpers.client.validate(args),
            path: util.format("users/%s/revoketoken%s", helpers.user.uniqueId(self), (revokeAll) ? "s" : ""),
            method: 'PUT',
            qs: (!revokeAll) ? {
                token: self.auth.token
            } : undefined
        }, function(error, usergridResponse, body) {
            self.auth.destroy()
            callback(error, usergridResponse, usergridResponse.ok)
        })
    },
    logoutAllSessions: function() {
        var args = helpers.args(arguments)
        args = _.concat([helpers.client.validate(args), true], args)
        return this.logout.apply(this, args)
    },
    resetPassword: function() {
        var self = this
        var args = helpers.args(arguments)
        var callback = helpers.cb(args)
        var client = helpers.client.validate(args)
        if (args[0] instanceof UsergridClient) {
            args.shift()
        }
        var body = {
            oldpassword: _.isPlainObject(args[0]) ? args[0].oldPassword : _.isString(args[0]) ? args[0] : undefined,
            newpassword: _.isPlainObject(args[0]) ? args[0].newPassword : _.isString(args[1]) ? args[1] : undefined
        }
        if (!body.oldpassword || !body.newpassword) {
            throw new Error('"oldPassword" and "newPassword" properties are required when resetting a user password')
        }
        return new UsergridRequest({
            client: client,
            path: util.format('users/%s/password', helpers.user.uniqueId(self)),
            method: 'PUT',
            body: body
        }, function(error, usergridResponse, body) {
            callback(error, usergridResponse, usergridResponse.ok)
        })
    }
}

util.inherits(UsergridUser, UsergridEntity)

module.exports = UsergridUser
module.exports.CheckAvailable = CheckAvailable