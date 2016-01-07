'use strict'

var Usergrid = require('../usergrid'),
    helpers = require('../helpers'),
    ok = require('objectkit'),
    _ = require('lodash')

var UsergridEntity = function() {
    var self = this

    var args = Array.prototype.slice.call(arguments)

    if (!args[0]) {
        throw new Error('A UsergridEntity object was initialized using an empty argument')
    }

    if (_.isObject(args[0])) {
        _.assign(self, args[0])
    } else {
        self.type = _.isString(args[0]) ? args[0] : undefined
        self.name = _.isString(args[1]) ? args[1] : undefined
    }

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

    helpers.setReadOnly(self, ['uuid', 'name', 'type', 'created'])

    return self
}

UsergridEntity.prototype = {
    putProperty: function(key, value) {
        this[key] = value
    },
    putProperties: function(obj) {
        _.assign(this, obj)
    },
    removeProperty: function(key) {
        this.removeProperties([key])
    },
    removeProperties: function(keys) {
        var self = this
        keys.forEach(function(key) {
            delete self[key]
        })
    },
    insert: function(key, value, idx) {
        if (!_.isArray(this[key])) {
            this[key] = this[key] ? [this[key]] : []
        }
        this[key].splice.apply(this[key], [idx, 0].concat(value))
    },
    append: function(key, value) {
        this.insert(key, value, Number.MAX_SAFE_INTEGER)
    },
    prepend: function(key, value) {
        this.insert(key, value, 0)
    },
    pop: function(key) {
        if (_.isArray(this[key])) {
            this[key].pop()
        }
    },
    shift: function(key) {
        if (_.isArray(this[key])) {
            this[key].shift()
        }
    },
    reload: function() {
        var args = Array.prototype.slice.call(arguments)
        var client = helpers.client.validate(args)
        var callback = helpers.cb(_.last(args.filter(_.isFunction)))
        client.GET(this, function(err, usergridResponse) {
            helpers.setWritable(this, ['uuid', 'name', 'type', 'created'])
            _.assign(this, usergridResponse.entity)
            helpers.setReadOnly(this, ['uuid', 'name', 'type', 'created'])
            callback(err || usergridResponse.error, usergridResponse, this)
        }.bind(this))
    },
    save: function() {
        var args = Array.prototype.slice.call(arguments)
        var client = helpers.client.validate(args)
        var callback = helpers.cb(_.last(args.filter(_.isFunction)))
        client.PUT(this, function(err, usergridResponse) {
            helpers.setWritable(this, ['uuid', 'name', 'type', 'created'])
            _.assign(this, usergridResponse.entity)
            helpers.setReadOnly(this, ['uuid', 'name', 'type', 'created'])
            callback(err || usergridResponse.error, usergridResponse, this)
        }.bind(this))
    },
    remove: function() {
        var args = Array.prototype.slice.call(arguments)
        var client = helpers.client.validate(args)
        var callback = helpers.cb(_.last(args.filter(_.isFunction)))
        client.DELETE(this, function(err, usergridResponse) {
            callback(err || usergridResponse.error, usergridResponse, this)
        }.bind(this))
    },
    attachAsset: function() {},
    uploadAsset: function() {},
    downloadAsset: function() {},
    connect: function() {
        var args = Array.prototype.slice.call(arguments)
        var client = helpers.client.validate(args)
        args.unshift(this)
        return client.connect.apply(client, args)
    },
    disconnect: function() {
        var args = Array.prototype.slice.call(arguments)
        var client = helpers.client.validate(args)
        args.unshift(this)
        return client.disconnect.apply(client, args)
    },
    getConnections: function() {
        var args = Array.prototype.slice.call(arguments)
        var client = helpers.client.validate(args)
        args.splice(1, 0, this)
        return client.getConnections.apply(client, args)
    }
}

module.exports = UsergridEntity