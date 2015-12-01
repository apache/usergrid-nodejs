'use strict'

var UsergridEntity = require('./entity'),
    helpers = require('../helpers'),
    ok = require('objectkit'),
    _ = require('underscore'),
    util = require('util')

var UsergridUser = function(object) {

    if (!ok(object).has('email') && !ok(object).has('username')) {
        // This is not a user entity
        return object
    }

    var self = this
    _.extend(self, object, UsergridEntity)
    UsergridEntity.call(self)
    helpers.setWritable(self, 'name')
    return self
}

util.inherits(UsergridUser, UsergridEntity)

module.exports = UsergridUser