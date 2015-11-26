var mutability = require('./mutability'),
    cb = require('./callbackCheck'),
    buildUrl = require('./buildUrl'),
    userAgent = require('./userAgent')

module.exports = {
    setImmutable: mutability.setImmutable,
    setMutable: mutability.setMutable,
    cb: cb,
    buildUrl: buildUrl,
    userAgent: userAgent
}