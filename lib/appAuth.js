'use strict'

var UsergridAuth = require('./auth'),
    util = require('util'),
    _ = require('lodash')

var UsergridAppAuth = function() {
    var self = this

    var args = Array.prototype.slice.call(arguments)
    if (typeof args[0] === 'object') {
        args = args[0]
    }

    self.clientId = args.clientId || args[0]
    self.clientSecret = args.clientSecret || args[1]
    self.tokenTtl = args.tokenTtl || args[2]
    UsergridAuth.call(self)
    _.assign(self, UsergridAuth)
    return self
}

util.inherits(UsergridAppAuth, UsergridAuth)

module.exports = UsergridAppAuth