'use strict'

var request = require('request'),
    helpers = require('../helpers'),
    UsergridResponse = require('../lib/response'),
    UsergridQuery = require('../lib/query'),
    UsergridAsset = require('../lib/asset'),
    ok = require('objectkit'),
    _ = require('lodash')

var UsergridRequest = function(options) {
    var self = this
    var client = helpers.client.validate(options.client)
    var callback = helpers.cb(helpers.args(arguments))

    if (!_.isString(options.type) && !_.isString(options.path) && !_.isString(options.uri)) {
        throw new Error('one of "type" (collection name), "path", or "uri" parameters are required when initializing a UsergridRequest')
    }

    if (!_.includes(['GET', 'PUT', 'POST', 'DELETE'], options.method)) {
        throw new Error('"method" parameter is required when initializing a UsergridRequest')
    }

    var uri = options.uri || helpers.build.uri(client, options)
    var formData = helpers.build.formData(options)
    var body = ((formData !== undefined) ? undefined : options.body)

    var req = request(uri, {
        headers: helpers.build.headers(client),
        body: body,
        json: true,
        method: options.method,
        qs: helpers.build.qs(options),
        formData: formData
    }, function(error, response) {
        var usergridResponse = new UsergridResponse(response)
        var returnBody = _.first([usergridResponse.user, usergridResponse.users, usergridResponse.entity, usergridResponse.entities, usergridResponse.body].filter(_.isObject))
        callback(error || usergridResponse.error, usergridResponse, returnBody)
    })
}

module.exports = UsergridRequest