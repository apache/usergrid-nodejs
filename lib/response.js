'use strict'

var ok = require('objectkit'),
    UsergridEntity = require('./entity.js'),
    UsergridUser = require('./user.js'),
    UsergridResponseError = require('./responseError.js'),
    helpers = require('../helpers'),
    _ = require('underscore')

_.mixin(require('underscore.string'))

function UsergridResponse(response) {
    if (ok(response.body).has('entities')) {
        var entities = response.body.entities.map(function(en) {
            var entity = new UsergridEntity(en)
            return (entity.isUser) ? new UsergridUser(entity) : entity
        })
        _.extend(response, {
            metadata: _.clone(response.body),
            entities: entities
        })
        delete response.metadata.entities
        response.first = _.first(entities) || undefined
        response.entity = response.first
        response.last = _.last(entities) || undefined

        if (ok(response).has('first.isUser') === true) {
            response.user = response.first
            response.users = response.entities
        }

        Object.defineProperty(response, 'hasNextPage', {
            get: function() {
                return ok(response).has('metadata.cursor')
            }
        })

        helpers.setReadOnly(response.metadata)
    } else {
        response.error = new UsergridResponseError(response.body)
    }
    return response;
}

module.exports = UsergridResponse