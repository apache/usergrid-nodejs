'use strict'

var ok = require('objectkit'),
    UsergridResponseError = require('./responseError.js'),
    helpers = require('../helpers'),
    _ = require('lodash')

function UsergridResponse(response) {
    if (!response) {
        return
    } else if (ok(response.body).has('entities')) {
        var UsergridEntity = require('./entity.js'),
            UsergridUser = require('./user.js')

        var entities = response.body.entities.map(function(en) {
            var entity = new UsergridEntity(en)
            if (entity.isUser) {
                entity = new UsergridUser(entity)
            }
            return entity
        })
        _.assign(response, {
            metadata: _.cloneDeep(response.body),
            entities: entities
        })
        delete response.metadata.entities
        response.first = _.first(entities) || undefined
        response.entity = response.first
        response.last = _.last(entities) || undefined   
        if (ok(response).getIfExists('metadata.path') === '/users') {
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