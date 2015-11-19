'use strict'

var UsergridRequest = require('./request'),
    ok = require('objectkit'),
    helpers = require('../helpers')

var UsergridClient = function(orgId, appId) {
    var self = this
    if (ok(orgId).exists() && ok(appId).exists()) {
        self.orgId = orgId
        self.appId = appId
        console.log(self.orgId, self.appId)
        return self;
    } else {
        throw new Error('orgId and appId must be passed during initialization')
    }
}

UsergridClient.prototype.GET = function(uri, options, callback) {
    return new UsergridRequest('GET', uri, options, callback)
}

// Exports
module.exports = UsergridClient