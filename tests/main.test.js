'use strict'

describe('Usergrid', function() {
    return require('./lib/usergrid.test')
})

describe('Usergrid singleton', function() {
    return require('./lib/usergrid.singleton.test')
})

describe('UsergridClient initialization', function() {
    return require('./lib/client.init.test')
})

describe.skip('UsergridClient REST operations', function() {
    return require('./lib/client.rest.test')
})

describe.skip('UsergridClient connections', function() {
    return require('./lib/client.connections.test')
})

describe('UsergridClient authentication', function() {
    return require('./lib/client.auth.test')
})

describe.skip('UsergridQuery', function() {
    return require('./lib/query.test')
})

describe.skip('UsergridResponse', function() {
    return require('./lib/response.test')
})

describe.skip('UsergridResponseError', function() {
    return require('./lib/responseError.test')
})

describe.skip('UsergridEntity', function() {
    return require('./lib/entity.test')
})