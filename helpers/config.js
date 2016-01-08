'use strict'

var util = require('util'),
    _ = require('lodash')

if (/mocha$/i.test(process.argv[1])) {
    var target = _(_.last(process.argv)).startsWith('--target=') ? _.last(process.argv).replace(/--target=/, '') : '1.0'
    var config = require('../tests/config.test.json')[target]
    if (config && target) {
        config.target = target
    } else {
        throw new Error(util.format("Could not load target '%s' from /tests/config.test.json", target))
    }
    module.exports = config
} else {
    try {
        module.exports = require('../config.json')
    } catch (e) {
        
    }
}