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

var UsergridUserAuth = function(options) {
    var self = this
    var args = _.flattenDeep(helpers.args(arguments))
    if (_.isPlainObject(args[0])) {
        options = args[0]
    }
    self.username = options.username || args[0]
    self.email = options.email
    if (options.password || args[1]) {
        self.password = options.password || args[1]
    }
    self.tokenTtl = options.tokenTtl || args[2]
    UsergridAuth.call(self)
    _.assign(self, UsergridAuth)
    return self
}

util.inherits(UsergridUserAuth, UsergridAuth)

module.exports = UsergridUserAuth