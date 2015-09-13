'use strict'
var extend = require('extend'),
    ok = require('objectkit'),
    helpers = require('../helpers'),
    _ = require('underscore')
_.mixin(require('underscore.string'));

function UsergridResponse(response) {
    if (ok(response.body).check('entities')) {
        var entities = response.body.entities
        extend(response, {
            metadata: extend({}, response.body),
            entities: entities
        })
        response.first = (function() { return entities[0] || undefined })()
        response.last = (function() { return entities[entities.length - 1] || entities[0] || undefined })()
        delete response.metadata.entities

        entities.forEach(function(entity) {
            // set uuid immutable
            helpers.setImmutable(entity, 'uuid')

            // set type immutable
            helpers.setImmutable(entity, 'type')

            // if not type user, set name immutable
            if (!(_(entity.type.toLowerCase()).startsWith('user'))) {
                helpers.setImmutable(entity, 'name')
            }
        })
        response.entities = entities
    } else {
        response.error = response.body
    }
    return response;
}

module.exports = UsergridResponse