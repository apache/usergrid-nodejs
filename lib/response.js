'use strict'

var ok = require('objectkit'),
    UsergridEntity = require('./entity.js'),
    UsergridResponseError = require('./responseError.js'),
    helpers = require('../helpers'),
    _ = require('underscore')

_.mixin(require('underscore.string'))

function UsergridResponse(response) {
    if (ok(response.body).has('entities')) {
        var entities = response.body.entities.map(function(entity) {
            return new UsergridEntity(entity)
        })
        _.extend(response, {
            metadata: _.map(response.body, _.clone),
            entities: entities
        })
        response.first = _.first(entities) || undefined
        response.entity = response.first
        response.last = _.last(entities) || undefined

        delete response.metadata.entities
        helpers.setReadOnly(response.metadata)

        entities.forEach(function(entity) {
            // set uuid immutable
            helpers.setReadOnly(entity, 'uuid')

            // set type immutable
            helpers.setReadOnly(entity, 'type')

            // if not type user, set name immutable
            if (!(_(entity.type.toLowerCase()).startsWith('user'))) {
                helpers.setReadOnly(entity, 'name')
            }
        })

        // if response contains users, add UsergridUser references
        if (response.first !== undefined && (_(response.first.type.toLowerCase()).startsWith('user'))) {
            if (response.entities.length === 1) {
                response.user = response.first
            } else {
                response.users = function() {
                    return this.entities
                }
            }
        }
        response.entities = entities
    } else {
        response.error = new UsergridResponseError(response.body)
    }
    return response;
}

module.exports = UsergridResponse