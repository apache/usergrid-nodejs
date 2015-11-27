var mutability = require('./mutability'),
    cb = require('./callbackCheck'),
    buildUrl = require('./buildUrl'),
    userAgent = require('./userAgent'),
    isNumeric = require('./isNumeric'),
    query = require('./query')

module.exports = {
    setImmutable: mutability.setImmutable,
    setMutable: mutability.setMutable,
    cb: cb,
    buildUrl: buildUrl,
    userAgent: userAgent,
    isNumeric: isNumeric,
    query: query
}