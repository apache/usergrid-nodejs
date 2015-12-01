var mutability = require('./mutability'),
    cb = require('./cb'),
    buildUrl = require('./buildUrl'),
    userAgent = require('./userAgent'),
    is = require('./is'),
    query = require('./query')

module.exports = {
    setReadOnly: mutability.setReadOnly,
    setWritable: mutability.setWritable,
    cb: cb,
    buildUrl: buildUrl,
    userAgent: userAgent,
    is: is,
    query: query
}