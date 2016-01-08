'use strict'

var ok = require('objectkit')

var UsergridResponseError = function(responseErrorObject) {
    if (ok(responseErrorObject).has('error') === false) {
        return
    }
    this.name = responseErrorObject.error
    this.description = responseErrorObject.description || responseErrorObject.error_description
    this.exception = responseErrorObject.exception
    return this
}

module.exports = UsergridResponseError