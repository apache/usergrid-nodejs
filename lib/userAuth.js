'use strict'

var UsergridAuth = require('./auth'),
    util = require('util'),
    _ = require('lodash')

var UsergridUserAuth = function(options) {
    var self = this

    self.email = options.email
    self.username = options.username
    if (options.password) {
        self.password = options.password
    }
    self.tokenTtl = options.tokenTtl
    UsergridAuth.call(self)
    _.assign(self, UsergridAuth)
    return self
}

util.inherits(UsergridUserAuth, UsergridAuth)

module.exports = UsergridUserAuth