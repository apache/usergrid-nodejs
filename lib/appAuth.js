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

var UsergridAuth = require('./auth'),
    helpers = require('../helpers'),
    util = require('util'),
    _ = require('lodash')

var UsergridAppAuth = function() {
    var self = this
    var args = _.flattenDeep(helpers.args(arguments))
    if (_.isPlainObject(args[0])) {
        self.clientId = args[0].clientId
        self.clientSecret = args[0].clientSecret
        self.tokenTtl = args[0].tokenTtl
    } else {
        self.clientId = args[0]
        self.clientSecret = args[1]
        self.tokenTtl = args[2]
    }
    UsergridAuth.call(self)
    _.assign(self, UsergridAuth)
    return self
}

util.inherits(UsergridAppAuth, UsergridAuth)

module.exports = UsergridAppAuth