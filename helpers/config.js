'use strict'

var util = require('util'),
    path = require('path'),
    file = require("file"),
    _ = require('lodash'),
    appRoot = path.dirname(require.main.filename)

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
        file.walkSync(appRoot, function(start, dirs, names) {
            if (_.includes(dirs, "config") && _.includes(names, "usergrid.json")) {
                module.exports = require(appRoot + '/config/usergrid.json')
            } else if (_.includes(dirs, "usergrid") && _.includes(names, "config.json")) {
                module.exports = require(appRoot + '/usergrid/config.json')
            } else if (_.includes(names, "config.json")) {
                module.exports = require(appRoot + '/config.json')
            }
        })
    } catch (e) {
        
    }
}