'use strict'

var helpers = require('../helpers'),
    util = require('util'),
    _ = require('underscore')

_.mixin(require('underscore.string'))

var UsergridQuery = function(type) {

    var query = '',
        sort

    var __nextIsNot = false

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
            query = self.andJoin(util.format('%s = %s', key, helpers.query.useQuotesIfRequired(value)))
            return self
        },
        gt: function(key, value) {
            query = self.andJoin(util.format('%s > %s', key, helpers.query.useQuotesIfRequired(value)))
            return self
        },
        gte: function(key, value) {
            query = self.andJoin(util.format('%s >= %s', key, helpers.query.useQuotesIfRequired(value)))
            return self
        },
        lt: function(key, value) {
            query = self.andJoin(util.format('%s < %s', key, helpers.query.useQuotesIfRequired(value)))
            return self
        },
        lte: function(key, value) {
            query = self.andJoin(util.format('%s <= %s', key, helpers.query.useQuotesIfRequired(value)))
            return self
        },
        contains: function(key, value) {
            query = self.andJoin(util.format('%s contains %s', key, helpers.query.useQuotesIfRequired(value)))
            return self
        },
        locationWithin: function(distanceInMeters, lat, lng) {
            query = self.andJoin(util.format('location within %s of %s, %s', distanceInMeters, lat, lng))
            return self
        },
        asc: function(key) {
            self.sort(key, 'asc')
            return self
        },
        desc: function(key) {
            self.sort(key, 'desc')
            return self
        },
        sort: function(key, order) {
            sort = (key && order) ? util.format(' order by %s %s', key, order) : ''
            return self
        },
        fromString: function(string) {
            self._ql = string
            return self
        },
        andJoin: function(append) {
            if (__nextIsNot) {
                append = util.format("not %s", append)
                __nextIsNot = false
            }
            if (!append) {
                return query
            } else if (query.length === 0) {
                return append
            } else {
                return (_(query).endsWith('and') || _(query).endsWith('or')) ? util.format('%s %s', query, append) : util.format('%s and %s', query, append)
            }
        },
        orJoin: function() {
            return (query.length > 0 && !_(query).endsWith('or')) ? util.format('%s or', query) : query
        }
    }

    // required properties
    self._type = self._type || type

    // public accessors
    Object.defineProperty(self, '_ql', {
        get: function() {
            return util.format('select * where %s%s', query || '', sort || '')
        }
    })

    Object.defineProperty(self, 'and', {
        get: function() {
            query = self.andJoin('')
            return self
        }
    })

    Object.defineProperty(self, 'or', {
        get: function() {
            query = self.orJoin()
            return self
        }
    })

    Object.defineProperty(self, 'not', {
        get: function() {
            __nextIsNot = true
            return self
        }
    })

    return self
}

module.exports = UsergridQuery