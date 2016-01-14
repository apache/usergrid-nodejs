'use strict'

var UsergridClient = require('../lib/client')
var Usergrid = require('../usergrid')

module.exports = {
    validate: function(args) {
        var client
        if (args instanceof UsergridClient) {
            client = args
        } else if (args[0] instanceof UsergridClient) {
            client = args[0]
        } else if (Usergrid.isInitialized) {
            client = Usergrid
        } else {
            throw new Error("This method requires a valid UsergridClient instance as an argument (or the Usergrid shared instance to be initialized)")
        } 
        return client
    }
}