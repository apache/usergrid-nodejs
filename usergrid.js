'use strict'

var UsergridClient = require('./lib/client')

var Usergrid = {
    initSharedInstance: function(options) {
        var self = this
        if (self.isInitialized) {
            return self
        }
        Object.setPrototypeOf(Usergrid, new UsergridClient(options))
        UsergridClient.call(self)
        self.isInitialized = true
    }
}

Usergrid.init = Usergrid.initSharedInstance
module.exports = Usergrid