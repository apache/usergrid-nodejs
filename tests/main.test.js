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

describe('Usergrid initialization', function() {
    return require('./lib/usergrid.init.test')
})

describe('Usergrid singleton', function() {
    return require('./lib/usergrid.singleton.test')
})

describe('Usergrid teardown', function() {
    return require('./lib/usergrid.teardown.test')
})

describe('UsergridClient initialization', function() {
    return require('./lib/client.init.test')
})

describe('UsergridClient REST operations', function() {
    return require('./lib/client.rest.test')
})

describe('UsergridClient connections', function() {
    return require('./lib/client.connections.test')
})

describe('UsergridClient authentication', function() {
    return require('./lib/client.auth.test')
})

describe('UsergridQuery', function() {
    return require('./lib/query.test')
})

describe('UsergridResponse', function() {
    return require('./lib/response.test')
})

describe('UsergridResponseError', function() {
    return require('./lib/responseError.test')
})

describe('UsergridEntity', function() {
    return require('./lib/entity.test')
})

describe('UsergridUser', function() {
    return require('./lib/user.test')
})

describe('UsergridAsset', function() {
    return require('./lib/asset.test')
})