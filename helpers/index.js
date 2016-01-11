'use strict'

var client = require('./client'),
    cb = require('./cb'),
    build = require('./build'),
    query = require('./query'),
    config = require('./config'),
    time = require('./time'),
    mutability = require('./mutability'),
    _ = require('lodash')

// by mixing this in here, lodash-uuid is available everywhere lodash is used.
_.mixin(require('lodash-uuid'))

module.exports = _.assign(module.exports, {
    client: client,
    cb: cb,
    build: build,
    query: query,
    config: config,
    time: time
}, mutability)