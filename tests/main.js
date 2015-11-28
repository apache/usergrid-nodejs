'use strict'

describe.skip('Usergrid', function() {
    return require('./lib/usergrid.test')
})

describe.skip('UsergridClient', function() {
    return require('./lib/client.test')
})

describe('UsergridQuery', function() {
    return require('./lib/query.test')
})