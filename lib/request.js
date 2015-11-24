'use strict'

var extend = require('extend'),
    request = require('request'),
    config = require('../config.json').config,
    UsergridResponse = require('../lib/response'),
    util = require('util'),
    urljoin = require('url-join'),
    ok = require('objectkit')

var UsergridRequest = function(opts, callback) {

    if (typeof opts.type !== 'string')
        throw new Error('\'type\' (or \'collection\') parameter is required when making a request')

    // uuidOrName and body are optional and not always passed; setting callback to the last defined argument
    var uri = urljoin(
        ok(config).getIfExists('usergrid.baseUrl'),
        opts.client.orgId,
        opts.client.appId,
        opts.type, (typeof opts.uuidOrName === 'string') ? opts.uuidOrName : ""
    )

    var params = request.initParams(uri, {
        headers: {
            'User-Agent': util.format("usergrid-nodejs/v%s", config.usergrid.version),
        },
        body: opts.body,
        qs: (opts.client.clientId !== undefined && opts.client.clientSecret !== undefined) ? {
            clientId: opts.client.clientId,
            clientSecret: opts.client.clientSecret
        } : undefined
    }, callback)

    params.method = opts.method

    // default to using JSON, since we only ever do that with Usergrid
    params.json = true

    request(params, function(error, response) {
        response = new UsergridResponse(response)
        params.callback(error, response)
    })
}

module.exports = UsergridRequest