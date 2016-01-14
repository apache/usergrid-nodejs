'use strict'

var ok = require('objectkit'),
    _ = require('lodash')

module.exports = function() {
    var args = _.flattenDeep(Array.prototype.slice.call(arguments))
    var emptyFunc = function() {}
    return _.first(_.flattenDeep([args.reverse(), ok(args).getIfExists('0.callback'), emptyFunc]).filter(_.isFunction))
}