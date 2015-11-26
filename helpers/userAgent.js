'use strict'

var util = require('util'),
    version = require('../package.json').version

module.exports = {
    'User-Agent': util.format("usergrid-nodejs/v%s", version)
}