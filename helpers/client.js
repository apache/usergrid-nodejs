'use strict'

var UsergridClient = require('../lib/client'),
    UsergridAuth = require('../lib/auth'),
    Usergrid = require('../usergrid'),
    helpers = require('../helpers')


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
            throw new Error("this method requires either the Usergrid shared instance to be initialized or a UsergridClient instance as the first argument")
        } 
        return client
    },
    configureTempAuth: function(auth) {
        if (auth instanceof UsergridAuth) {
            return auth
        } else if (!auth || auth === UsergridAuth.NO_AUTH) {
            return UsergridAuth.NO_AUTH
        } else {
            return undefined
        }
    }
}