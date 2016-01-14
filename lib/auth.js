'use strict'

var UsergridAuth = function(token, expiry) {
    var self = this

    self.token = token || undefined
    self.expiry = expiry || 0

    var usingToken = (token) ? true : false

    Object.defineProperty(self, "hasToken", {
        get: function() {
            return (typeof self.token === 'string' && self.token.length > 0)
        },
        configurable: true
    })

    Object.defineProperty(self, "isExpired", {
        get: function() {
            return usingToken || (Date.now() >= self.expiry)
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