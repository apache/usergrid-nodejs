'use strict'

var UsergridAuth = require('./auth'),
    util = require('util')

var UsergridAppAuth = function(opts) {
    var self = this
    if (arguments.length === 3) {
        opts = arguments
    }
    self.clientId = (opts.length === 3) ? opts[0] : opts.clientId
    self.clientSecret = (opts.length === 3) ? opts[1] : opts.clientSecret
    self.tokenTtl = (opts.length === 3) ? opts[2] : opts.tokenTtl
    UsergridAuth.call(self)
    return self
}

util.inherits(UsergridAppAuth, UsergridAuth)

module.exports = UsergridAppAuth