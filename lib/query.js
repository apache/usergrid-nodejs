/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict'

var helpers = require('../helpers'),
    util = require('util'),
    _ = require('lodash')

var UsergridQuery = function(type) {

    var self = this

    var query = '',
        queryString,
        sort,
        __nextIsNot = false

    // builder pattern
    _.assign(self, {
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
        cursor: function(value) {
            self._cursor = value
            return self
        },
        eq: function(key, value) {
            query = self.andJoin(util.format('%s = %s', key, helpers.query.useQuotesIfRequired(value)))
            return self
        },
        equal: this.eq,
        gt: function(key, value) {
            query = self.andJoin(util.format('%s > %s', key, helpers.query.useQuotesIfRequired(value)))
            return self
        },
        greaterThan: this.gt,
        gte: function(key, value) {
            query = self.andJoin(util.format('%s >= %s', key, helpers.query.useQuotesIfRequired(value)))
            return self
        },
        greaterThanOrEqual: this.gte,
        lt: function(key, value) {
            query = self.andJoin(util.format('%s < %s', key, helpers.query.useQuotesIfRequired(value)))
            return self
        },
        lessThan: this.lt,
        lte: function(key, value) {
            query = self.andJoin(util.format('%s <= %s', key, helpers.query.useQuotesIfRequired(value)))
            return self
        },
        lessThanOrEqual: this.lte,
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
            queryString = string
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
                return (_.endsWith(query, 'and') || _.endsWith(query, 'or')) ? util.format('%s %s', query, append) : util.format('%s and %s', query, append)
            }
        },
        orJoin: function() {
            return (query.length > 0 && !_.endsWith(query, 'or')) ? util.format('%s or', query) : query
        }
    })

    // required properties
    self._type = self._type || type

    // public accessors
    Object.defineProperty(self, '_ql', {
        get: function() {
            if (queryString !== undefined) {
                return queryString
            } else {
                return util.format('select * %s %s', ((query.length > 0) ? 'where ' + (query || '') : ''),((sort !== undefined) ? sort : '')).trim()
            }
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