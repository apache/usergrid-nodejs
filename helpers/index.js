var mutability = require('./mutability'),
    cb = require('./cb'),
    build = require('./build'),
    userAgent = require('./userAgent'),
    query = require('./query'),
    config = require('./config'),
    _ = require('lodash')

module.exports = _.extend(module.exports, {
    cb: cb,
    build: build,
    userAgent: userAgent,
    query: query,
    config: config
}, mutability)