var mutability = require('./mutability'),
    cb = require('./cb'),
    buildUrl = require('./buildUrl'),
    userAgent = require('./userAgent'),
    is = require('./is'),
    query = require('./query')

module.exports = {
    setImmutable: mutability.setImmutable,
    setMutable: mutability.setMutable,
    cb: cb,
    buildUrl: buildUrl,
    userAgent: userAgent,
    is: is,
    query: query
}