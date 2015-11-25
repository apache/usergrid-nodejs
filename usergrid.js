'use strict'

var UsergridClient = require('./lib/client'),
    helpers = require('./helpers'),
    util = require("util")

var Usergrid = {
    initSharedInstance: function(opts) {
        var self = this
        Object.setPrototypeOf(Usergrid, new UsergridClient(opts))
        UsergridClient.call(self)
    }
}

Usergrid.init = Usergrid.initSharedInstance

module.exports = Usergrid