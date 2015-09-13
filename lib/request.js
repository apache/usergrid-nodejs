'use strict'
var extend = require('extend'),
    request = require('request'),
    UsergridResponse = require('../lib/response'),
    ok = require('objectkit')

var UsergridRequest = function(method, uri, options, callback) {
    
    if (typeof uri === 'undefined' && ok(options).check('uri') === ok.false) {
        throw new Error('undefined is not a valid uri or options object.')
    }

    var params = request.initParams(uri, options, callback)
    params.method = method

    // default to using JSON, since we only ever do that with Usergrid
    params.json = true

    request(params, function(error, response) {
        response = new UsergridResponse(response);
        params.callback(error, response);
    });
};

module.exports = UsergridRequest;