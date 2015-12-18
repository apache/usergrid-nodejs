'use strict'

var request = require('request'),
    helpers = require('../helpers'),
    UsergridResponse = require('../lib/response'),
    UsergridQuery = require('../lib/query'),
    util = require('util'),
    _ = require('lodash')

var UsergridRequest = function(options) {
    options.callback = helpers.cb(options.callback)

    if (!_.isString(options.type)) {
        throw new Error('"type" (collection name) parameter is required when making a request')
    }

    var headers = helpers.userAgent

    if (options.client.appAuth && options.client.appAuth.isTokenValid) {
        _.assign(headers, {
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
        var usergridResponse = new UsergridResponse(response)
        options.callback(error, usergridResponse, usergridResponse.entities)
    })

}

module.exports = UsergridRequest