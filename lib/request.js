'use strict'

var request = require('request'),
    helpers = require('../helpers'),
    UsergridResponse = require('../lib/response')

var UsergridRequest = function(options, callback) {
    callback = helpers.cb(callback)
    if (typeof options.type !== 'string') {
        throw new Error('"type" (or "collection") parameter is required when making a request')
    }
    request(helpers.buildUrl(options), {
        headers: helpers.userAgent,
        body: options.body,
        json: true,
        method: options.method
    }, function(error, response) {
        response = new UsergridResponse(response)
        callback(error, response)
    })
}

module.exports = UsergridRequest