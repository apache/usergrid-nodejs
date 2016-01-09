'use strict'

var UsergridAuth = require('./auth'),
    util = require('util'),
    _ = require('lodash')

var UsergridAppAuth = function(options) {
    var self = this
    var args = _.flatten(Array.prototype.slice.call(arguments), true)
    if (_.isPlainObject(args[0])) {
        options = args[0]
    }
    self.clientId = options.clientId || args[0]
    self.clientSecret = options.clientSecret || args[1]
    self.tokenTtl = options.tokenTtl || args[2]
    UsergridAuth.call(self)
    _.assign(self, UsergridAuth)
    return self
}

util.inherits(UsergridAppAuth, UsergridAuth)

module.exports = UsergridAppAuth