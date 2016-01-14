'use strict'

var _ = require('lodash')

module.exports = function(args) {
    return _.flattenDeep(Array.prototype.slice.call(args))
}