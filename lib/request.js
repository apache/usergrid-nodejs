'use strict'

var request = require('request'),
    helpers = require('../helpers'),
    UsergridResponse = require('../lib/response'),
    UsergridQuery = require('../lib/query'),
    util = require('util'),
    _ = require('underscore')

var UsergridRequest = function(options) {
    options.callback = helpers.cb(options.callback)

    if (typeof options.type !== 'string') {
        throw new Error('"type" (or "collection") parameter is required when making a request')
    }

    var headers = helpers.userAgent

    if (options.client.appAuth && options.client.appAuth.isTokenValid) {
        _.extend(headers, {
            authorization: util.format("Bearer %s", options.client.appAuth.token)
        })
    }

    request(helpers.build.url(options), {
        headers: headers,
        body: options.body,
        json: true,
        method: options.method,
        qs: (options.query instanceof UsergridQuery) ? {
            ql: options.query._ql,
            limit: options.query._limit
        } : undefined
    }, function(error, response) {
        options.callback(error, new UsergridResponse(response))
    })

}

module.exports = UsergridRequest