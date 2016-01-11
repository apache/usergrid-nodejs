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

    Object.defineProperty(self, 'tokenTtl', {
        configurable: true
    })

    return self
}

UsergridAuth.prototype = {
    destroy: function() {
        this.token = undefined
        this.expiry = 0
        this.tokenTtl = undefined
    }
}

module.exports = UsergridAuth
module.exports.AuthFallback = {
    APP: 'APP',
    NONE: 'NONE'
}