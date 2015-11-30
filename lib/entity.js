'use strict'

var _ = require('underscore')

var UsergridEntity = function(object) {
    var self = this
    _.extend(self, object)
    return self
}

module.exports = UsergridEntity