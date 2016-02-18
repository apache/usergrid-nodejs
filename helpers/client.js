/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict'

var Usergrid = require('../usergrid'),
    helpers = require('../helpers'),
    _ = require('lodash')


module.exports = {
    validate: function(args) {
        var UsergridClient = require('../lib/client')
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
        var UsergridAuth = require('../lib/auth')
        if (_.isString(auth) && auth !== UsergridAuth.NO_AUTH) {
            return new UsergridAuth(auth)
        } else if (!auth || auth === UsergridAuth.NO_AUTH) {
            return UsergridAuth.NO_AUTH
        } else if (auth instanceof UsergridAuth) {
            return auth
        } else {
            return undefined
        }
    }
}