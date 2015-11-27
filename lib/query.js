'use strict'

var helpers = require('../helpers'),
    util = require('util')

var UsergridQuery = function(type) {

    var eq, gt, gte, lt, lte, contains, locationWithin, sort

    // builder pattern
    var self = {
        type: function(value) {
            self._type = value
            return self
        },
        collection: function(value) {
            self._type = value
            return self
        },
        limit: function(value) {
            self._limit = value
            return self
        },
        eq: function(key, value) {
            eq = util.format('%s = %s', key, helpers.query.useQuotesIfRequired(value))
            return self
        },
        gt: function(key, value) {
            gt = util.format('%s > %s', key, helpers.query.useQuotesIfRequired(value))
            return self
        },
        gte: function(key, value) {
            gte = util.format('%s >= %s', key, helpers.query.useQuotesIfRequired(value))
            return self
        },
        lt: function(key, value) {
            lt = util.format('%s < %s', key, helpers.query.useQuotesIfRequired(value))
            return self
        },
        lte: function(key, value) {
            lte = util.format('%s <= %s', key, helpers.query.useQuotesIfRequired(value))
            return self
        },
        contains: function(key, value) {
            contains = util.format('%s contains %s', key, helpers.query.useQuotesIfRequired(value))
            return self
        },
        locationWithin: function(distanceInMeters, lat, lng) {
            locationWithin = util.format('location within %s of %s, %s', distanceInMeters, lat, lng)
            return self
        },
        asc: function(key) {
            this.sort(key, 'asc')
            return self
        },
        desc: function(key) {
            this.sort(key, 'desc')
            return self
        },
        sort: function(key, order) {
            sort = (key && order) ? util.format(' order by %s %s', key, order) : ''
            return self
        },
        or: function() {
            return self
        },
        fromString: function(string) {
            self.ql = string
            return self
        }
    }

    // required properties
    self._type = self._type || type

    // public accessors
    Object.defineProperty(self, '_ql', {
        get: function() {
            return util.format('select * where %s%s', eq || gt || gte || lt || lte || contains || '', sort || '')
        }
    })

    return self
}

module.exports = UsergridQuery