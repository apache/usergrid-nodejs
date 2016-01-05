'use strict'

var util = require('util'),
    _ = require('lodash')

module.exports = {
    useQuotesIfRequired: function(value) {
        return (_.isFinite(value) || _.isUuid(value) || _.isBoolean(value) || _.isObject(value) && !_.isFunction(value) || _.isArray(value)) ? value : util.format("'%s'", value)
    }
}