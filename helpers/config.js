'use strict'

var _ = require('lodash')
_.mixin(require('underscore.string'))

if (/mocha$/i.test(process.argv[1])) {
    var target = _(_.last(process.argv)).startsWith('--target=') ? _.last(process.argv).replace(/--target=/, '') : '1.0'
    var config = require('../tests/config.test.json')[target] || require('../config.json')
    if (target) {
        config.target = target
    }
    module.exports = config
} else {
    module.exports = require('../config.json')
}