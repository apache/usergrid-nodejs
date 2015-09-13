function setImmutable(obj, property) {
    return Object.defineProperty(obj, property, { configurable: false, writable: false });
}

function setMutable(obj, property) {
    return Object.defineProperty(obj, property, { configurable: true, writable: true });
}

module.exports = {
    setImmutable: setImmutable,
    setMutable: setMutable
}