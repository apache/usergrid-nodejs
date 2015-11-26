function setImmutable(obj, key) {
    return Object.defineProperty(obj, key, { configurable: false, writable: false })
}

function setMutable(obj, key) {
    return Object.defineProperty(obj, key, { configurable: true, writable: true })
}

module.exports = {
    setImmutable: setImmutable,
    setMutable: setMutable
}