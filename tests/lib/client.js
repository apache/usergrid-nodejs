'use strict'

var should = require('should'),
    ok = require('objectkit'),
    config = require('../../config.json'),
    helpers = require('../../helpers'),
    Usergrid = require('../../usergrid'),
    UsergridClient = require('../../lib/client'),
    UsergridAuth = require('../../lib/auth'),
    UsergridAppAuth = require('../../lib/appAuth')

var _collection = config.tests.collection
var _client = null
var _uuid = null

describe('initialization', function() {
    it('should initialize', function(done) {
        _client = new UsergridClient()
        _client.should.be.an.instanceof(UsergridClient)
        done()
    })
})

describe('GET()', function() {

    this.slow(1000)
    this.timeout(6000)

    var response
    before(function(done) {
        _client.GET(_collection, function(err, usergridResponse) {
            response = usergridResponse
            done()
        })
    })

    it('should not fail when a callback function is not passed', function() {
        // note: this test will NOT fail gracefully inside the Mocha event chain
        _client.GET(_collection)
    })

    it('should return a 200 ok', function() {
        response.statusCode.should.equal(200)
    })

    it('response.entities should be an array', function() {
        response.entities.should.be.an.Array
    })

    it('response.first should exist and have a valid uuid', function() {
        response.first.should.be.an.Object.and.have.property('uuid').with.a.lengthOf(36)
    })

    it('response.entity should exist and have a valid uuid', function() {
        response.entity.should.be.an.Object.and.have.property('uuid').with.a.lengthOf(36)
    })

    it('response.last should exist and have a valid uuid', function() {
        response.last.should.be.an.Object.and.have.property('uuid').with.a.lengthOf(36)
    })
})

describe('POST()', function() {

    this.slow(1000)
    this.timeout(3000)

    var response
    before(function(done) {
        _client.POST(_collection, {
            author: 'Sir Arthur Conan Doyle'
        }, function(err, usergridResponse) {
            response = usergridResponse
            _uuid = usergridResponse.entity.uuid
            done()
        })
    })

    it('should not fail when a callback function is not passed', function() {
        // note: this test will NOT fail gracefully inside the Mocha event chain
        _client.POST(_collection, {})
    })

    it('should return a 200 ok', function() {
        response.statusCode.should.equal(200)
    })

    it('response.entities should be an array', function() {
        response.entities.should.be.an.Array.with.a.lengthOf(1)
    })

    it('response.entity should exist and have a valid uuid', function() {
        response.entity.should.be.an.Object.and.have.property('uuid').with.a.lengthOf(36)
    })

    it('response.entity.author should equal \'Sir Arthur Conan Doyle\'', function() {
        response.entity.should.have.property('author').equal('Sir Arthur Conan Doyle')
    })
})

describe('PUT()', function() {

    this.slow(1000)
    this.timeout(3000)

    var response
    before(function(done) {
        _client.PUT(_collection, _uuid, {
            narrator: 'Peter Doyle'
        }, function(err, usergridResponse) {
            response = usergridResponse
            done()
        })
    })

    it('should not fail when a callback function is not passed', function() {
        // note: this test will NOT fail gracefully inside the Mocha event chain
        _client.PUT(_collection, _uuid)
    })

    it('should return a 200 ok', function() {
        response.statusCode.should.equal(200)
    })

    it('response.entities should be an array', function() {
        response.entities.should.be.an.Array.with.a.lengthOf(1)
    })

    it('response.entity should exist and its uuid should the uuid from the previous POST requets', function() {
        response.entity.should.be.an.Object.and.have.property('uuid').equal(_uuid)
    })

    it('response.entity.narrator should equal \'Peter Doyle\'', function() {
        response.entity.should.have.property('narrator').equal('Peter Doyle')
    })
})

describe('DELETE()', function() {

    this.slow(1000)
    this.timeout(6000)

    var response
    before(function(done) {
        _client.DELETE(_collection, _uuid, function(err, usergridResponse) {
            _client.GET(_collection, _uuid, function(err, usergridResponse) {
                response = usergridResponse
                done()
            })
        })
    })

    it('should not fail when a callback function is not passed', function() {
        // note: this test will NOT fail gracefully inside the Mocha event chain
        _client.DELETE(_collection, _uuid)
    })

    it('should return a 200 ok', function() {
        // This should check for 404, but because of a Usergrid bug, it returns 401 instead of 404.
        // see https://issues.apache.org/jira/browse/USERGRID-1128
        response.statusCode.should.not.equal(200)
    })

    it('response.error.name should equal \'service_resource_not_found\'', function() {
        response.error.name.should.equal('service_resource_not_found')
    })
})

describe('authenticateApp()', function() {

    this.slow(1000)
    this.timeout(6000)

    var response, token
    before(function(done) {
        _client.setAppAuth(config.usergrid.clientId, config.usergrid.clientSecret, config.usergrid.tokenTtl)
        _client.authenticateApp(function(err, r, t) {
            response = r
            token = t
            done()
        })
    })

    it('should return a 200 ok', function() {
        response.statusCode.should.equal(200)
    })

    it('should have a valid token', function() {
        token.should.be.a.String
        token.length.should.be.greaterThan(10)
    })

    it('should set .appAuth.token', function() {
        _client.appAuth.should.have.property('token').equal(token)
    })

    it('should set .appAuth.expiry to future date', function() {
        _client.appAuth.should.have.property('expiry').greaterThan(new Date().getSeconds())
    })
})

describe('setAppAuth()', function() {
    it('should initialize by passing a list of arguments', function() {
        _client.setAppAuth(config.usergrid.clientId, config.usergrid.clientSecret, config.usergrid.tokenTtl)
        _client.appAuth.should.be.instanceof(UsergridAppAuth)
        _client.setAppAuth({
            clientId: config.usergrid.clientId,
            clientSecret: config.usergrid.clientSecret,
            tokenTtl: config.usergrid.tokenTtl
        })
        _client.appAuth.should.be.instanceof(UsergridAuth)
        _client.setAppAuth(new UsergridAppAuth(config.usergrid.clientId, config.usergrid.clientSecret, config.usergrid.tokenTtl))
        _client.appAuth.should.be.instanceof(UsergridAppAuth)
    })

    it('should initialize by passing an object', function() {
        _client.setAppAuth({
            clientId: config.usergrid.clientId,
            clientSecret: config.usergrid.clientSecret,
            tokenTtl: config.usergrid.tokenTtl
        })
        _client.appAuth.should.be.instanceof(UsergridAppAuth)
    })

    it('should initialize by passing an instance of UsergridAppAuth', function() {
        _client.setAppAuth({
            clientId: config.usergrid.clientId,
            clientSecret: config.usergrid.clientSecret,
            tokenTtl: config.usergrid.tokenTtl
        })
        _client.appAuth.should.be.instanceof(UsergridAppAuth)
    })

    it('should be a subclass of UsergridAuth', function() {
        _client.appAuth.should.be.instanceof(UsergridAuth)
    })
})