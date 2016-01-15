'use strict'

var request = require('request'),
    helpers = require('../helpers'),
    UsergridResponse = require('../lib/response'),
    UsergridQuery = require('../lib/query'),
    util = require('util'),
    ok = require('objectkit'),
    _ = require('lodash')

var UsergridRequest = function(options) {
    var client = helpers.client.validate(options.client)
    var callback = helpers.cb(helpers.args(arguments))

    if (!_.isString(options.type) && !_.isString(options.path) && !_.isString(options.uri)) {
        throw new Error('one of "type" (collection name), "path", or "uri" parameters are required when initializing a UsergridRequest')
    }
    if (!_.includes(['GET', 'PUT', 'POST', 'DELETE'], options.method)) {
        throw new Error('"method" parameter is required when initializing a UsergridRequest')
    }

    var uri = options.uri || helpers.build.uri(client, options)

    request(uri, {
        headers: helpers.build.headers(client),
        body: options.body,
        json: true,
        method: options.method,
        qs: (options.query instanceof UsergridQuery) ? {
            ql: options.query._ql || undefined,
            limit: options.query._limit,
            cursor: options.query._cursor
        } : options.qs
    }, function(error, response) {
        var usergridResponse = new UsergridResponse(response)
        var returnBody = _.first([usergridResponse.entity, usergridResponse.entities, usergridResponse.body].filter(_.isObject))
        callback(error || usergridResponse.error, usergridResponse, returnBody)
    })
}

module.exports = UsergridRequest