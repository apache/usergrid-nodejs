'use strict'

var extend = require('extend'),
    request = require('request'),
    config = require('../config.json'),
    version = require('../package.json').version,
    UsergridResponse = require('../lib/response'),
    helpers = require('../helpers'),
    urljoin = require('url-join'),
    ok = require('objectkit')

var UsergridRequest = function(opts, callback) {
    callback = helpers.cb(callback)
    if (typeof opts.type !== 'string')
        throw new Error('\'type\' (or \'collection\') parameter is required when making a request')
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