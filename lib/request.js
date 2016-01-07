'use strict'

var request = require('request'),
    helpers = require('../helpers'),
    UsergridResponse = require('../lib/response'),
    UsergridQuery = require('../lib/query'),
    util = require('util'),
    _ = require('lodash')

var UsergridRequest = function(options) {
    if (!_.isString(options.type)) {
        throw new Error('"type" (collection name) parameter is required when making a request')
    }

    var headers = helpers.userAgent

    if (options.client.appAuth && options.client.appAuth.isValid) {
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