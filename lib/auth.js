'use strict'

var ok = require('objectkit'),
    helpers = require('../helpers')

var UsergridAuth = function() {
    var self = this
    self.accessToken = undefined
    self.expiry = 0
    self.hasToken = false
    self.tokenIsValid = false
    helpers.setImmutable(self, 'isExpired')
    return self
}

Object.defineProperty(UsergridAuth.prototype, "isExpired", {
    get: function() {
        return (new Date() >= this.expiry) ? true : false
    }
})

module.exports = UsergridAuth