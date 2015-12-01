'use strict'

var ok = require('objectkit')

var UsergridResponseError = function(responseErrorObject) {
    if (ok(responseErrorObject).has('error') === false) {
        return
    }
    var self = this
    self.name = responseErrorObject.error
    self.description = responseErrorObject.description
    self.exception = responseErrorObject.exception
    return self
}

module.exports = UsergridResponseError