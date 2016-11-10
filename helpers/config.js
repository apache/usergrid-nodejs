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

var util = require('util'),
    path = require('path'),
    file = require("file"),
    _ = require('lodash'),
    appRoot = path.dirname(require.main.filename)

if (/mocha$/i.test(process.argv[1])) {
    var target = (_.last(process.argv)).startsWith('--target=') ? _.last(process.argv).replace(/--target=/, '') : '2.1'
    var config = require('../tests/config.test.json')[target]
    if (config && target) {
        config.target = target
    } else {
        throw new Error(util.format("Could not load target '%s' from /tests/config.test.json", target))
    }
    module.exports = config
} else {
    try {
        file.walkSync(appRoot, function(start, dirs, names) {
            if (_.includes(names, "config.json") || _.includes(names, "usergrid.json")) {
                var name = _.first(names.filter(function(name) {
                    return name == "config.json" || name == "usergrid.json"
                }).sort().reverse())
                var configPath = util.format("%s/%s", start, name)
                module.exports = require(configPath)
                if (module.exports.orgId === undefined || module.exports.appId === undefined) {
                    console.log(util.format("Config file '%s' is not a valid Usergrid configuration file", configPath))
                    module.exports = {}
                } else {
                    console.log(util.format("Using config file '%s'", configPath))
                }
            }
        })
    } catch (e) {

    }
}