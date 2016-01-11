'use strict'

var UsergridEntity = require('./entity'),
    UsergridQuery = require('./query'),
    UsergridUserAuth = require('./userAuth'),
    UsergridResponseError = require('./responseError'),
    request = require('request'),
    helpers = require('../helpers'),
    ok = require('objectkit'),
    util = require('util'),
    _ = require('lodash')

var UsergridUser = function(obj) {

    if (!ok(obj).has('email') && !ok(obj).has('username')) {
        // This is not a user entity
        throw new Error('"email" or "username" property is required when initializing a UsergridUser object')
    }

    var self = this
    self.type = "user"

    _.assign(self, UsergridEntity.call(self, obj))

    helpers.setWritable(self, 'name')
    return self
}

var CheckAvailable = function() {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    var client = helpers.client.validate(args)
    var callback = helpers.cb(_.last(args.filter(_.isFunction)))
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

    client.GET(checkQuery, function(err, usergridResponse) {
        callback(err || usergridResponse.error, usergridResponse, (usergridResponse.entities.length > 0))
    }.bind(self))
}

UsergridUser.prototype = {
    create: function() {
        var self = this
        var args = Array.prototype.slice.call(arguments)
        var client = helpers.client.validate(args)
        var callback = helpers.cb(_.last(args.filter(_.isFunction)))
        client.POST(self, function(err, usergridResponse) {
            delete self.password
            _.assign(self, usergridResponse.entity)
            callback(err || usergridResponse.error, usergridResponse, usergridResponse.user)
        }.bind(self))
    },
    login: function() {
        var self = this
        var args = Array.prototype.slice.call(arguments)
        var client = helpers.client.validate(args)
        var callback = helpers.cb(_.last(args.filter(_.isFunction)))
        client.POST('token', helpers.build.userLoginBody(self), function(error, response) {
            delete self.password
            if (response.statusCode === 200) {
                self.auth = new UsergridUserAuth(response.body.user)
                self.auth.token = response.body.access_token
                self.auth.expiry = helpers.time.expiry(response.body.expires_in)
                self.auth.tokenTtl = response.body.expires_in
            } else {
                error = new UsergridResponseError(response.body)
            }
            callback(error || response.error, response, response.body.access_token)
        }.bind(self))
    },
    logout: function() {
        var self = this
        var args = _.flatten(Array.prototype.slice.call(arguments), true)
        var callback = helpers.cb(_.last(args.filter(_.isFunction)))
        if (!self.auth || !self.auth.isValid) {
            return callback({
                name: 'no_valid_token',
                description: 'this user does not have a valid token'
            })
        }
        var client = helpers.client.validate(args)
        var revokeAll = _.first(args.filter(_.isBoolean)) || false
        var userId = _.first([self.uuid, self.username, self.email].filter(_.isString))
        var url = util.format("%s%s/revoketoken%s", helpers.build.url(client, {
            type: 'user'
        }), userId, (revokeAll) ? "s" : "")
        request(url, {
            headers: helpers.build.headers(client),
            json: true,
            method: 'PUT',
            qs: (!revokeAll) ? {
                token: self.auth.token
            } : undefined
        }, function(error, response) {
            var UsergridResponse = require('./response'),
                usergridResponse = new UsergridResponse(response)
            if (usergridResponse.statusCode === 200) {
                self.auth.destroy()
            } else {
                error = new UsergridResponseError(response.body)
            }
            callback(error || usergridResponse.error, usergridResponse, (usergridResponse.statusCode === 200))
        })
    },
    logoutAllSessions: function() {
        var args = Array.prototype.slice.call(arguments)
        args.unshift(true)
        return this.logout.apply(this, args)
    },
    resetPassword: function() {
        var self = this
        var args = _.flatten(Array.prototype.slice.call(arguments), true)
        var callback = helpers.cb(_.last(args.filter(_.isFunction)))
        var client = helpers.client.validate(args)
        var body = {
            oldpassword: _.isPlainObject(args[0]) ? args[0].oldPassword : _.isString(args[0]) ? args[0] : undefined,
            newpassword: _.isPlainObject(args[0]) ? args[0].newPassword : _.isString(args[1]) ? args[1] : undefined
        }
        if (!body.oldpassword || !body.newpassword) {
            throw new Error('"oldPassword" and "newPassword" properties are required when resetting a user password')
        }
        var userId = _.first([self.uuid, self.username, self.email].filter(_.isString))
        var url = util.format("%s%s/password", helpers.build.url(client, {
            type: 'user'
        }), userId)
        request(url, {
            headers: helpers.build.headers(client),
            json: true,
            method: 'PUT',
            body: body
        }, function(error, response) {
            var UsergridResponse = require('./response'),
                usergridResponse = new UsergridResponse(response)
            if (usergridResponse.statusCode >= 400) {
                error = new UsergridResponseError(response.body)
            }
            callback(error || usergridResponse.error, usergridResponse, (usergridResponse.statusCode < 400))
        })
    }
}

util.inherits(UsergridUser, UsergridEntity)

module.exports = UsergridUser
module.exports.CheckAvailable = CheckAvailable