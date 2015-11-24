'use strict'

var UsergridClient = require('./lib/client'),
    helpers = require('./helpers'),
    util = require("util")

var Usergrid = {
    initSharedInstance: function(orgId, appId) {
        Object.setPrototypeOf(Usergrid, new UsergridClient(orgId, appId))
    }
}

Usergrid.init = Usergrid.initSharedInstance

module.exports = Usergrid