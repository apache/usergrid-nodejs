function setReadOnly(obj, key) {
    if (typeof obj[key] === 'object') {
        return Object.freeze(obj[key])
    } else if (typeof obj === 'object' && key === undefined) {
        return Object.freeze(obj)
    } else {
        return Object.defineProperty(obj, key, { configurable: false, writable: false })
    }
}

function setWritable(obj, key) {
    return Object.defineProperty(obj, key, { configurable: true, writable: true })
}

module.exports = {
    setReadOnly: setReadOnly,
    setWritable: setWritable
}