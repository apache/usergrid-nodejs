'use strict'

var UsergridEntity = require('./entity'),
    helpers = require('../helpers'),
    ok = require('objectkit'),
    util = require('util'),
    _ = require('lodash')

var UsergridUser = function(obj) {

    if (!ok(obj).has('email') && !ok(obj).has('username')) {
        // This is not a user entity
        throw new Error('"email" or "username" property is required when initializing a UsergridUser object')
    }

    var self = this

    _.assign(self, UsergridEntity.call(self, obj))

    helpers.setWritable(self, 'name')
    return self
}

util.inherits(UsergridUser, UsergridEntity)

module.exports = UsergridUser