var mutability = require('./mutability')
var cb = require('./callbackCheck')

module.exports = {
    setImmutable: mutability.setImmutable,
    setMutable: mutability.setMutable,
    cb: cb
}