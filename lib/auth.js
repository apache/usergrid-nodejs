'use strict'

var UsergridAuth = function() {
    var self = this

    self.token = undefined
    self.expiry = 0

    Object.defineProperty(self, "hasToken", {
        get: function() {
            return (typeof self.token === 'string' && self.token.length > 0)
        },
        configurable: true
    })

    Object.defineProperty(self, "isExpired", {
        get: function() {
            return (Date.now() >= self.expiry)
        },
        configurable: true
    })

    Object.defineProperty(self, "isValid", {
        get: function() {
            return (!self.isExpired && self.hasToken)
        },
        configurable: true
    })

    return self
}

module.exports = UsergridAuth