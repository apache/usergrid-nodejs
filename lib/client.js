'use strict'

var UsergridRequest = require('./request'),
    ok = require('objectkit'),
    helpers = require('../helpers'),
    url = require('url')

var UsergridClient = function(orgId, appId) {
    var self = this
    if (ok(orgId).exists() && ok(appId).exists()) {
        self.orgId = orgId
        self.appId = appId
        return self;
    } else {
        throw new Error('\'orgId\' and \'appId\' parameters must be passed during UsergridClient initialization')
    }
}

UsergridClient.prototype.GET = function(type, uuid, callback) {
    return new UsergridRequest({
        client: this,
        method: 'GET',
        type: type,
        uuid: typeof uuid === 'string' ? uuid : undefined
    }, callback || uuid)
}

UsergridClient.prototype.PUT = function(type, uuid, body, callback) {
    if (typeof uuid !== 'string')
        throw new Error('\'uuid\' (or \'name\') parameter must be defined when making a PUT request')
    return new UsergridRequest({
        client: this,
        method: 'PUT',
        type: type,
        uuid: typeof uuid === 'string' ? uuid : undefined,
        body: typeof body === 'object' ? body : typeof uuid === 'object' ? uuid : undefined
    }, callback || body || uuid)
}

UsergridClient.prototype.POST = function(type, uuid, body, callback) {
    return new UsergridRequest({
        client: this,
        method: 'POST',
        type: type,
        uuid: typeof uuid === 'string' ? uuid : undefined,
        body: typeof body === 'object' ? body : typeof uuid === 'object' ? uuid : undefined
    }, callback || body || uuid)
}

UsergridClient.prototype.DELETE = function(type, uuid, callback) {
    if (typeof uuid !== 'string')
        throw new Error('\'uuid\' (or \'name\') parameter must be defined when making a DELETE request')
    return new UsergridRequest({
        client: this,
        method: 'DELETE',
        type: type,
        uuid: typeof uuid === 'string' ? uuid : undefined
    }, callback || uuid)
}

module.exports = UsergridClient