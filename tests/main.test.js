'use strict'

// module config
var should = require('should'),
    validator = require('validator'),
    _ = require('lodash')

_.mixin(require('lodash-uuid'))

should.Assertion.add('uuid', function() {
    this.params = {
        operator: 'to be a valid uuid'
    }
    this.assert(_.isUuid(this.obj))
})

should.Assertion.add('buffer', function() {
    this.params = {
        operator: 'to be buffer data'
    }
    this.assert(Buffer.isBuffer(this.obj))
})

// end module config

describe.skip('Usergrid initialization', function() {
    return require('./lib/usergrid.init.test')
})

describe.skip('Usergrid singleton', function() {
    return require('./lib/usergrid.singleton.test')
})

describe.skip('Usergrid teardown', function() {
    return require('./lib/usergrid.teardown.test')
})

describe.skip('UsergridClient initialization', function() {
    return require('./lib/client.init.test')
})

describe.skip('UsergridClient REST operations', function() {
    return require('./lib/client.rest.test')
})

describe.skip('UsergridClient connections', function() {
    return require('./lib/client.connections.test')
})

describe.skip('UsergridClient authentication', function() {
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

describe('UsergridEntity', function() {
    return require('./lib/entity.test')
})

describe.skip('UsergridUser', function() {
    return require('./lib/user.test')
})

describe.skip('UsergridAsset', function() {
    return require('./lib/asset.test')
})