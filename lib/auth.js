/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict'

var UsergridAuth = function(token, expiry) {
    var self = this

    self.token = token
    self.expiry = expiry || 0

    var usingToken = (token) ? true : false

    Object.defineProperty(self, "hasToken", {
        get: function() {
            return (self.token) ? true : false
        },
        configurable: true
    })

    Object.defineProperty(self, "isExpired", {
        get: function() {
            return (usingToken) ? false : (Date.now() >= self.expiry)
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
        configurable: true,
        writable: true
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

Object.defineProperty(module.exports, 'AUTH_MODE_APP', {
    enumerable: false,
    get: function() { return "APP" }
})
Object.defineProperty(module.exports, 'AUTH_MODE_USER', {
    enumerable: false,
    get: function() { return "USER" }
})
Object.defineProperty(module.exports, 'AUTH_MODE_NONE', {
    enumerable: false,
    get: function() { return "NONE" }
})
Object.defineProperty(module.exports, 'NO_AUTH', {
    enumerable: false,
    get: function() { return "NO_AUTH" }
})