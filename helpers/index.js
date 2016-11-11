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

var args = require('./args'),
    client = require('./client'),
    cb = require('./cb'),
    build = require('./build'),
    query = require('./query'),
    config = require('./config'),
    time = require('./time'),
    mutability = require('./mutability'),
    user = require('./user'),
    _ = require('lodash')

// by mixing this in here, lodash-uuid is available everywhere lodash is used.
_.mixin(require('lodash-uuid'))

module.exports = _.assign(module.exports, {
    args: args,
    client: client,
    cb: cb,
    build: build,
    query: query,
    config: config,
    time: time,
    user: user
}, mutability)