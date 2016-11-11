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

var _ = require('lodash')

module.exports = {
    setReadOnly: function(obj, key) {
        if (_.isArray(key)) {
            return key.forEach(function(k) {
                module.exports.setReadOnly(obj, k)
            })
        } else if (_.isPlainObject(obj[key])) {
            return Object.freeze(obj[key])
        } else if (_.isPlainObject(obj) && key === undefined) {
            return Object.freeze(obj)
        } else if (_.has(obj,key)) {
            return Object.defineProperty(obj, key, {
                writable: false
            })
        } else {
            return obj
        }
    },
    setWritable: function(obj, key) {
        if (_.isArray(key)) {
            return key.forEach(function(k) {
                module.exports.setWritable(obj, k)
            })
        // Note that once Object.freeze is called on an object, it cannot be unfrozen, so we need to clone it
        } else if (_.isPlainObject(obj[key])) {
            return _.clone(obj[key])
        } else if (_.isPlainObject(obj) && key === undefined) {
            return _.clone(obj)
        } else if (_.has(obj,key)) {
            return Object.defineProperty(obj, key, {
                writable: true
            })
        } else {
            return obj
        }
    }
}