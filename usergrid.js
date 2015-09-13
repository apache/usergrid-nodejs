'use strict'
var extend = require('extend'),
    request = require('request'),
    UsergridRequest = require('./lib/request')

var Usergrid = function() {}

Usergrid.GET = function(uri, options, callback) {
    return new UsergridRequest('GET', uri, options, callback)
}

module.exports = Usergrid