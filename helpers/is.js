'use strict'

module.exports = {
    numeric: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n)
    },
    uuid: function(s) {
        return (/([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)/i).test(s)
    },
    bool: function(b) {
        return typeof(b) === "boolean"
    }
}