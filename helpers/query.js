'use strict'

var is = require('./is'),
    util = require('util')

module.exports = {
    useQuotesIfRequired: function(value) {
        return (is.numeric(value) || is.uuid(value) || is.bool(value)) ? value : util.format("'%s'", value)
    }
}