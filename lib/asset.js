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

var fileType = require('file-type'),
    helpers = require('../helpers'),
    stream = require('stream'),
    util = require('util'),
    _ = require('lodash')

var UsergridAsset = function() {
    var self = this
    var args = helpers.args(arguments)

    var __contentType
    var __binaryData = []

    if (args.length === 0) {
        throw new Error('A UsergridAsset object cannot be initialized without passing one or more arguments')
    }

    if (_.isPlainObject(args[0])) {
        _.assign(self, args[0])
    } else {
        self.filename = _.isString(args[0]) ? args[0] : undefined
        self.data = _.first(args.filter(Buffer.isBuffer)) || []
        self.originalLocation = _.first([args[2], args[1]].filter(function(property) {
            return _.isString(property)
        }))

        self.contentType = _.isString(args[3]) ? args[3] : undefined

        stream.PassThrough.call(self)
        self._write = function(chunk, encoding, done) {
            __binaryData.push(chunk)
            done()
        }
        self.on('finish', function() {
            self.data = Buffer.concat(__binaryData)
        })
    }

    Object.defineProperty(self, 'contentLength', {
        get: function() {
            return (self.data) ? self.data.byteLength : 0
        }
    })

    Object.defineProperty(self, 'contentType', {
        get: function() {
            if (__contentType) {
                return __contentType
            } else if (Buffer.isBuffer(self.data)) {
                __contentType = fileType(self.data) != null ? fileType(self.data).mime : undefined
                return __contentType
            }
        },
        set: function(contentType) {
            if (contentType) {
                __contentType = contentType
            } else if (Buffer.isBuffer(self.data)) {
                __contentType = fileType(self.data) != null ? fileType(self.data).mime : undefined
            }
        }
    })

    return self
}

util.inherits(UsergridAsset, stream.PassThrough)


module.exports = UsergridAsset
module.exports.DEFAULT_FILE_NAME = 'file'