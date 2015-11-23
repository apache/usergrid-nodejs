'use strict'

var UsergridClient = require('./lib/client'),
    helpers = require('./helpers'),
    util = require("util")

var Usergrid = {
    initialize: function(orgId, appId) {
        Object.setPrototypeOf(Usergrid, new UsergridClient(orgId, appId))
    }
}

Usergrid.init = Usergrid.initialize

module.exports = Usergrid