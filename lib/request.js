'use strict'

var request = require('request'),
    helpers = require('../helpers'),
    UsergridResponse = require('../lib/response'),
    util = require('util'),
    _ = require('underscore')

var UsergridRequest = function(options, callback) {
    callback = helpers.cb(callback)
    if (typeof options.type !== 'string') {
        throw new Error('"type" (or "collection") parameter is required when making a request')
    }
    var headers = helpers.userAgent

    if (options.client.appAuth && options.client.appAuth.isTokenValid) {
        _.extend(headers, {
            authorization: util.format("Bearer %s", options.client.appAuth.token)
        })
    }
    request(helpers.buildUrl(options), {
        headers: headers,
        body: options.body,
        json: true,
        method: options.method
    }, function(error, response) {
        response = new UsergridResponse(response)
        callback(error, response)
    })
}

module.exports = UsergridRequest