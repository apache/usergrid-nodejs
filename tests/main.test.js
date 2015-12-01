'use strict'

describe.skip('Usergrid', function() {
    return require('./lib/usergrid.test')
})

describe.skip('UsergridClient', function() {
    return require('./lib/client.test')
})

describe.skip('UsergridQuery', function() {
    return require('./lib/query.test')
})

describe('UsergridResponse', function() {
    return require('./lib/response.test')
})

describe('UsergridResponseError', function() {
    return require('./lib/responseError.test')
})