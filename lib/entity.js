'use strict'

var helpers = require('../helpers'),
    ok = require('objectkit'),
    _ = require('lodash')

var UsergridEntity = function(obj) {
    var self = this

    if (!obj) {
        throw new Error('A UsergridEntity object was initialized using an empty argument')
    }

    _.assign(self, obj)

    if (typeof self.type !== 'string') {
        throw new Error('"type" (or "collection") parameter is required when initializing a UsergridEntity object')
    }

    Object.defineProperty(self, 'isUser', {
        get: function() {
            return (self.type.toLowerCase() === 'user')
        }
    })

    Object.defineProperty(self, 'hasAsset', {
        get: function() {
            return ok(self).has(['file', 'file-metadata'])
        }
    })

    helpers.setReadOnly(self, ['uuid', 'name', 'type', 'created', 'modified', 'file', 'file-metadata'])

    return self
}

module.exports = UsergridEntity