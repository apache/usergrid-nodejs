'use strict'

module.exports = {
    expiry: function(expires_in) {
        return Date.now() + ((expires_in ? expires_in - 5 : 0) * 1000)
    }
}