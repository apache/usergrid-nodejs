'use strict'

var _ = require('lodash')

module.exports = function(callback) {
    return _.isFunction(callback) ? callback : function() {}
}