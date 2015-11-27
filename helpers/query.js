'use strict'

var isNumeric = require('./isNumeric'),
    util = require('util')

module.exports = {
    useQuotesIfRequired: function(value) {
        return isNumeric(value) ? value : util.format('\'%s\'', value)
    }
}