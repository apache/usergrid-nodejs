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

    request(helpers.build.url(options.client, options), {
        headers: helpers.build.headers(options.client),
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