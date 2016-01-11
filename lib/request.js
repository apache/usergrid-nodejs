'use strict'

var request = require('request'),
    helpers = require('../helpers'),
    UsergridResponse = require('../lib/response'),
    UsergridQuery = require('../lib/query'),
    util = require('util'),
    ok = require('objectkit'),
    _ = require('lodash')

var UsergridRequest = function(options) {
    if (!_.isString(options.type)) {
        throw new Error('"type" (collection name) parameter is required when making a request')
    }

    var headers = helpers.userAgent

    var UsergridAuth = require('../lib/auth')

    if (ok(options).getIfExists('auth.isValid')) {
        // Checks if an auth param was passed to the request and uses the token if applicable
        _.assign(headers, {
            authorization: util.format("Bearer %s", options.auth.token)
        })
    } else if (options.client.authFallback === UsergridAuth.AuthFallback.APP && ok(options).getIfExists('client.appAuth.isValid')) {
        // If auth-fallback is set to APP, this request will make a call using the application token
        _.assign(headers, {
            authorization: util.format("Bearer %s", options.client.appAuth.token)
        })
    }

    request(helpers.build.url(options.client, options), {
        headers: headers,
        body: options.body,
        json: true,
        method: options.method,
        qs: (options.query instanceof UsergridQuery) ? {
            ql: options.query._ql || undefined,
            limit: options.query._limit,
            cursor: options.query._cursor
        } : undefined
    }, function(error, response) {
        var usergridResponse = new UsergridResponse(response)
        options.callback(error || usergridResponse.error, usergridResponse, usergridResponse.entities)
    })
}

module.exports = UsergridRequest