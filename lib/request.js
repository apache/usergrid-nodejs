'use strict'

var request = require('request'),
    UsergridResponse = require('../lib/response')

var UsergridRequest = function(opts, callback) {
    callback = helpers.cb(callback)
    if (typeof opts.type !== 'string') {
        throw new Error('"type" (or "collection") parameter is required when making a request')
    }
    request(helpers.buildUrl(opts), {
        headers: helpers.userAgent,
        body: opts.body,
        json: true,
        method: opts.method
    }, function(error, response) {
        response = new UsergridResponse(response)
        callback(error, response)
    })
}

module.exports = UsergridRequest