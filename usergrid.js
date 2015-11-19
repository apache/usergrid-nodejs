'use strict'

var UsergridClient = require('./lib/client'),
    // ok = require('objectkit'),
    helpers = require('./helpers'),
    util = require("util")

var Usergrid = function() {
    var self = this
    if (self) {
        return self
    } else {
        throw new Error('Usergrid shared instance has not been initialized')
    }
}

util.inherits(Usergrid, UsergridClient);

Usergrid.prototype.initialize = function(orgId, appId, callback) {
    var self = this
    self = new UsergridClient(orgId, appId)
}

// Exports
module.exports = new Usergrid