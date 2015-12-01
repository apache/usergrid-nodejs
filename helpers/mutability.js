'use strict'

var ok = require('objectkit')

function setReadOnly(obj, key) {
    if (typeof obj[key] === 'array') {
        return obj[key].forEach(function(k) {
            setReadOnly(obj, k)
        })
    } else if (typeof obj[key] === 'object') {
        return Object.freeze(obj[key])
    } else if (typeof obj === 'object' && key === undefined) {
        return Object.freeze(obj)
    } else if (ok(obj).has(key)) {
        return Object.defineProperty(obj, key, {
            configurable: false,
            writable: false
        })
    } else {
        return obj
    }
}

function setWritable(obj, key) {
    // Note that once Object.freeze is called on an object, it cannot be unfrozen
    if (typeof obj[key] === 'array') {
        return obj[key].forEach(function(k) {
            setWritable(obj, k)
        })
    } else if (ok(obj).has(key)) {
        return Object.defineProperty(obj, key, {
            configurable: true,
            writable: true
        })
    } else {
        return obj
    }
}

module.exports = {
    setReadOnly: setReadOnly,
    setWritable: setWritable
}