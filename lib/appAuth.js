'use strict'

var UsergridAuth = require('./auth'),
    util = require('util')

var UsergridAppAuth = function(options) {
    var self = this
    if (arguments.length === 3) {
        options = arguments
    }
    self.clientId = (options.length === 3) ? options[0] : options.clientId
    self.clientSecret = (options.length === 3) ? options[1] : options.clientSecret
    self.tokenTtl = (options.length === 3) ? options[2] : options.tokenTtl
    UsergridAuth.call(self)
    return self
}

util.inherits(UsergridAppAuth, UsergridAuth)

module.exports = UsergridAppAuth