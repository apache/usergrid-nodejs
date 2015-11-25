'use strict'

var should = require('should'),
    ok = require('objectkit'),
    config = require('../config.json').config,
    Usergrid = require('../usergrid'),
    UsergridClient = require('../lib/client'),
    UsergridAuth = require('../lib/auth'),
    UsergridAppAuth = require('../lib/appAuth')    

const _collection = 'tests'
var _client = null
var _uuid = null

describe('Usergrid.initSharedInstance', function() {

    it('should fail to initialize without an orgId and appId', function() {
        should(function() {
            Usergrid.init(null, null)
        }).throw()
    })

    it('should initialize when passing an orgId and appId', function(done) {
        Usergrid.init(config.usergrid.orgId, config.usergrid.appId)
        done()
    })

    it('should initialize using orgId and appId from config.json', function(done) {
        Usergrid.init()
        done()
    })

    it('Usergrid\'s properties should match those defined in config.json', function(done) {
        Object(Usergrid).should.containDeep(config.usergrid)
        done()
    })

    it('Usergrid should be an instance of UsergridClient', function(done) {
        Usergrid.should.be.an.instanceof(UsergridClient)
        done()
    })

    it('Usergrid should have default values set for non-init-time properties', function() {
        Usergrid.paginationPreloadPages.should.equal(0)
        Usergrid.paginationCacheTimeout.should.equal(300 * 1000)
        Usergrid.paginationCursors.should.be.an.Array.with.a.lengthOf(0)
    })

});

describe('UsergridClient', function() {
    it('should instantiate a new instance of UsergridClient', function(done) {
        _client = new UsergridClient()
        _client.should.be.an.instanceof(UsergridClient)
        done()
    })
})

describe('UsergridClient.GET', function() {

    this.slow(1000)
    this.timeout(6000)

    describe('make a GET call to Usergrid and retrieve entities', function() {
        var response
        before(function(done) {
            _client.GET(_collection, function(err, usergridResponse) {
                response = usergridResponse
                done()
            })
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
})

describe('UsergridClient.POST', function() {

    this.slow(1000)
    this.timeout(3000)

    describe('make a POST call to Usergrid and create an entity', function() {

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
})

describe('UsergridClient.PUT', function() {

    this.slow(1000)
    this.timeout(3000)

    describe('make a PUT call to Usergrid and update an entity', function() {

        var response
        before(function(done) {
            _client.PUT(_collection, _uuid, {
                narrator: 'Peter Doyle'
            }, function(err, usergridResponse) {
                response = usergridResponse
                done()
            })
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
})

describe('UsergridClient.DELETE', function() {

    this.slow(1000)
    this.timeout(6000)

    describe('make a DELETE call to Usergrid and delete an entity', function() {
        var response
        before(function(done) {
            _client.DELETE(_collection, _uuid, function(err, usergridResponse) {
                _client.GET(_collection, _uuid, function(err, usergridResponse) {
                    response = usergridResponse
                    done()
                })
            })
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
})

describe('UsergridClient.appAuth', function() {
    it('should instantiate a new instance of UsergridAppAuth', function() {
        _client.setAppAuth(config.usergrid.clientId, config.usergrid.clientSecret, config.usergrid.tokenTtl)
        _client.appAuth.should.be.instanceof(UsergridAuth)
        _client.setAppAuth({
            clientId: config.usergrid.clientId,
            clientSecret: config.usergrid.clientSecret,
            tokenTtl: config.usergrid.tokenTtl
        })
        _client.appAuth.should.be.instanceof(UsergridAuth)
        _client.setAppAuth(new UsergridAppAuth(config.usergrid.clientId, config.usergrid.clientSecret, config.usergrid.tokenTtl))
        _client.appAuth.should.be.instanceof(UsergridAuth)
        _client.appAuth.should.be.instanceof(UsergridAppAuth)
    })
})