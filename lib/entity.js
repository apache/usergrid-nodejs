'use strict'

var Usergrid = require('../usergrid'),
    helpers = require('../helpers'),
    ok = require('objectkit'),
    _ = require('lodash')

var UsergridEntity = function(obj) {
    var self = this

    if (!obj) {
        throw new Error('A UsergridEntity object was initialized using an empty argument')
    }

    _.assign(self, obj)

    if (!_.isString(self.type)) {
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

UsergridEntity.prototype = {
    connect: function() {
        var args = Array.prototype.slice.call(arguments)
        args.unshift(this)
        return Usergrid.connect.apply(Usergrid, args)
    },
    disconnect: function() {
        var args = Array.prototype.slice.call(arguments)
        args.unshift(this)
        return Usergrid.disconnect.apply(Usergrid, args)
    },
    getConnections: function() {
        var args = Array.prototype.slice.call(arguments)
        args.splice(1, 0, this)
        return Usergrid.getConnections.apply(Usergrid, args)
    }
}

module.exports = UsergridEntity