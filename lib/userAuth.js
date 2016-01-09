'use strict'

var UsergridAuth = require('./auth'),
    util = require('util'),
    _ = require('lodash')

var UsergridUserAuth = function(options) {
    var self = this
    var args = _.flatten(Array.prototype.slice.call(arguments), true)
    if (_.isPlainObject(args[0])) {
        options = args[0]
    }
    self.username = options.username || args[0]
    self.email = options.email
    if (options.password || args[1]) {
        self.password = options.password || args[1]
    }
    self.tokenTtl = options.tokenTtl || args[2]
    UsergridAuth.call(self)
    _.assign(self, UsergridAuth)
    return self
}

util.inherits(UsergridUserAuth, UsergridAuth)

module.exports = UsergridUserAuth