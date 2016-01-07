'use strict'

var UsergridClient = require('../lib/client')
var Usergrid = require('../usergrid')

module.exports = {
    validate: function(args) {
        var client
        if (args[0] instanceof UsergridClient) {
            client = args[0]
            args.shift()
        } else if (Usergrid.isInitialized) {
            client = Usergrid
        } else {
            throw new Error("This method requires a valid UsergridClient instance (or the Usergrid shared instance) to be initialized")
        } 
        return client
    }
}