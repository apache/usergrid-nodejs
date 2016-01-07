'use strict'

var ok = require('objectkit'),
    _ = require('lodash')

module.exports = {
    setReadOnly: function(obj, key) {
        if (_.isArray(key)) {
            return key.forEach(function(k) {
                module.exports.setReadOnly(obj, k)
            })
        } else if (_.isPlainObject(obj[key])) {
            return Object.freeze(obj[key])
        } else if (_.isPlainObject(obj) && key === undefined) {
            return Object.freeze(obj)
        } else if (ok(obj).has(key)) {
            return Object.defineProperty(obj, key, {
                writable: false
            })
        } else {
            return obj
        }
    },
    setWritable: function(obj, key) {
        if (_.isArray(key)) {
            return key.forEach(function(k) {
                module.exports.setWritable(obj, k)
            })
        // Note that once Object.freeze is called on an object, it cannot be unfrozen, so we need to clone it
        } else if (_.isPlainObject(obj[key])) {
            return _.clone(obj[key])
        } else if (_.isPlainObject(obj) && key === undefined) {
            return _.clone(obj)
        } else if (ok(obj).has(key)) {
            return Object.defineProperty(obj, key, {
                writable: true
            })
        } else {
            return obj
        }
    }
}