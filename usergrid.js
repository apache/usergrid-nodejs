'use strict'

var Usergrid = {
    isInitialized: false,
    isSharedInstance: true,
    initSharedInstance: function(options) {
        var self = this
        if (self.isInitialized) {
            return self
        }
        var UsergridClient = require('./lib/client')
        Object.setPrototypeOf(Usergrid, new UsergridClient(options))
        UsergridClient.call(self)
        self.isInitialized = true
        self.isSharedInstance = true
    }
}

Usergrid.init = Usergrid.initSharedInstance
module.exports = Usergrid