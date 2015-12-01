'use strict'

var helpers = require('../helpers')

var UsergridAuth = function() {
    var self = this
    self.token = undefined
    self.expiry = 0
    helpers.setReadOnly(self, 'hasToken')
    helpers.setReadOnly(self, 'isTokenValid')
    helpers.setReadOnly(self, 'isExpired')
    return self
}

Object.defineProperty(UsergridAuth.prototype, "hasToken", {
    get: function() {
        return (typeof this.token === 'string' && this.token.length > 0) ? true : false
    }
})

Object.defineProperty(UsergridAuth.prototype, "isTokenValid", {
    get: function() {
        return (new Date() >= this.expiry && this.hasToken) ? true : false
    }
})

Object.defineProperty(UsergridAuth.prototype, "isExpired", {
    get: function() {
        return (new Date() >= this.expiry) ? true : false
    }
})

module.exports = UsergridAuth