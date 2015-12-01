'use strict'

var _ = require('underscore'),
    helpers = require('../helpers'),
    ok = require('objectkit')

var UsergridEntity = function(object) {
    var self = this
    _.extend(self, object)

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