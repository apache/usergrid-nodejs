var extend = require('extend'),
    Ok = require('objectkit').Ok

function UsergridResponse(response) {
    var entities = Ok(response.body).getIfExists('entities');
    extend(response, {
        metadata: extend({}, response.body),
        entities: entities
    });
    response.first = (function() {
        return entities[0]
    })();
    response.last = (function() {
        return entities[entities.length - 1] || entities[0]
    })();
    delete response.metadata.entities
    return response;
}

module.exports = UsergridResponse