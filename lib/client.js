'use strict'

var UsergridRequest = require('./request'),
    ok = require('objectkit'),
    helpers = require('../helpers'),
    config = require('../package.json'),
    urljoin = require('url-join');

var UsergridClient = function(orgId, appId) {
    var self = this
    if (ok(orgId).exists() && ok(appId).exists()) {
        self.orgId = orgId
        self.appId = appId
        return self;
    } else {
        throw new Error('orgId and appId must be passed during initialization')
    }
}

UsergridClient.prototype.GET = function(type, options, callback) {
    callback = callback || options
    var uri = urljoin(config.usergrid.baseUrl, this.orgId, this.appId, type)
    return new UsergridRequest('GET', uri, options, callback)
}

UsergridClient.prototype.PUT = function(type, options, callback) {
    callback = callback || options
    var uri = urljoin(config.usergrid.baseUrl, this.orgId, this.appId, type)
    return new UsergridRequest('PUT', uri, options, callback)
}

UsergridClient.prototype.POST = function(type, options, callback) {
    callback = callback || options
    var uri = urljoin(config.usergrid.baseUrl, this.orgId, this.appId, type)
    return new UsergridRequest('POST', uri, options, callback)
}

UsergridClient.prototype.DELETE = function(type, options, callback) {
    callback = callback || options
    var uri = urljoin(config.usergrid.baseUrl, this.orgId, this.appId, type)
    return new UsergridRequest('DELETE', uri, options, callback)
}

// Exports
module.exports = UsergridClient