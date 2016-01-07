'use strict'

var ok = require('objectkit'),
    UsergridQuery = require('./query'),
    UsergridResponseError = require('./responseError'),
    helpers = require('../helpers'),
    _ = require('lodash')

var UsergridResponse = function(response) {
    var self = this
    if (!response) {
        return
    } else if (ok(response.body).has('entities') && response.statusCode < 400) {
        var UsergridEntity = require('./entity.js'),
            UsergridUser = require('./user.js')

        var entities = response.body.entities.map(function(en) {
            var entity = new UsergridEntity(en)
            if (entity.isUser) {
                entity = new UsergridUser(entity)
            }
            return entity
        })

        _.assign(self, response, {
            metadata: _.cloneDeep(response.body),
            entities: entities
        })
        delete self.metadata.entities
        self.first = _.first(entities) || undefined
        self.entity = self.first
        self.last = _.last(entities) || undefined   
        if (ok(self).getIfExists('metadata.path') === '/users') {
            self.user = self.first
            self.users = self.entities
        }

        Object.defineProperty(self, 'hasNextPage', {
            get: function() {
                return ok(self).has('metadata.cursor')
            }
        })

        helpers.setReadOnly(self.metadata)
    } else {
        _.assign(self, response, {
            error: new UsergridResponseError(response.body)
        })
    }
    return self;
}

UsergridResponse.prototype = {
    loadNextPage: function() {
        var args = Array.prototype.slice.call(arguments)
        var callback = helpers.cb(_.last(args.filter(_.isFunction)))
        if (!this.metadata.cursor) {
            callback()
        }
        var client = helpers.client.validate(args)
        var type = _.last(ok(this).getIfExists('metadata.path').split('/'))
        var limit = _.first(ok(this).getIfExists('metadata.params.limit'))
        var query = new UsergridQuery(type).cursor(this.metadata.cursor).limit(limit)
        return client.GET(query, callback)
    }
}

module.exports = UsergridResponse