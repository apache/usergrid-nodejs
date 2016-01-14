'use strict'

var _ = require('lodash')

module.exports = {
    uniqueId: function(user) {
        return _.first([user.uuid, user.username, user.email].filter(_.isString))
    }
}