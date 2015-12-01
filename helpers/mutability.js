function setReadOnly(obj, key) {
    return Object.defineProperty(obj, key, { configurable: false, writable: false })
}

function setWritable(obj, key) {
    return Object.defineProperty(obj, key, { configurable: true, writable: true })
}

module.exports = {
    setReadOnly: setReadOnly,
    setWritable: setWritable
}