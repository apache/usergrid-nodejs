'use strict'

var Usergrid = require('../usergrid'),
    readChunk = require('read-chunk'),
    fileType = require('file-type'),
    helpers = require('../helpers'),
    stream = require('stream'),
    util = require('util'),
    ok = require('objectkit'),
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