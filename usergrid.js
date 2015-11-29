'use strict'

var UsergridClient = require('./lib/client')

var Usergrid = {
    initSharedInstance: function(options) {
        var self = this
        Object.setPrototypeOf(Usergrid, new UsergridClient(options))
        UsergridClient.call(self)
    }
}

Usergrid.init = Usergrid.initSharedInstance

module.exports = Usergrid