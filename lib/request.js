var extend = require('extend'),
    request = require('request'),
    UsergridResponse = require('./response')

var UsergridRequest = function(method, uri, options, callback) {

    if (typeof uri === 'undefined') {
        throw new Error('undefined is not a valid uri or options object.')
    }

    var params = request.initParams(uri, options, callback)
    params.method = method
    params.json = true

    request(params, function(error, response) {
        response = new UsergridResponse(response);
        callback(error, response, response.entities);
    });
};

module.exports = UsergridRequest;