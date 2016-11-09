'use strict'

var should = require('should'),
    config = require('../../helpers').config,
    UsergridClient = require('../../lib/client'),
    UsergridEntity = require('../../lib/entity'),
    UsergridUser = require('../../lib/user'),
    UsergridQuery = require('../../lib/query'),
    UsergridResponseError = require('../../lib/responseError'),
    _ = require('lodash')

var client = new UsergridClient()

var _response,
    _slow = 500,
    _timeout = 4000

before(function(done) {

    this.slow(_slow)
    this.timeout(_timeout)

    client.GET(config.test.collection, function(err, usergridResponse) {
        _response = usergridResponse
        done()
    })
})

describe('headers', function() {
    it('should be an object', function() {
        _response.headers.should.be.an.Object().with.property('content-type')
    })
})

describe('statusCode', function() {
    it('should be a number', function() {
        _response.statusCode.should.be.a.Number()
    })
})

describe('ok', function() {
    it('should be a bool', function() {
        _response.ok.should.be.a.Boolean()
    })
})

describe('metadata', function() {
    it('should be a read-only object', function() {
        _response.metadata.should.be.an.Object().with.any.properties(['action', 'application', 'path', 'uri', 'timestamp', 'duration'])
        Object.isFrozen(_response.metadata).should.be.true()
        should(function() {
            _response.metadata.uri = 'TEST'
        }).throw()
    })
})

describe('error', function() {
    it('should be a UsergridResponseError object', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        client.GET(config.test.collection, 'BADNAMEORUUID', function(err, usergridResponse) {
            usergridResponse.error.should.be.an.instanceof(UsergridResponseError)
            done()
        })
    })
})

describe('users', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    it('response.users should be an array of UsergridUser objects', function(done) {
        client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl)
        client.authenticateApp(function(err, response) {
            should(err).be.undefined()
            client.GET('users', function(err, usergridResponse) {
                usergridResponse.ok.should.be.true()
                usergridResponse.users.should.be.an.Array()
                usergridResponse.users.forEach(function(user) {
                    user.should.be.an.instanceof(UsergridUser)
                })
                done()
            })
        })
    })
})

describe('user', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var user

    it('response.user should be a UsergridUser object and have a valid uuid matching the first object in response.users', function(done) {
        client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl)
        client.authenticateApp(function(err) {
            should(err).be.undefined()
            client.GET('users', function(err, usergridResponse) {
                user = usergridResponse.user
                user.should.be.an.instanceof(UsergridUser).with.property('uuid').equal(_.first(usergridResponse.entities).uuid)
                done()
            })
        })
    })

    it('response.user should be a subclass of UsergridEntity', function(done) {
        user.isUser.should.be.true()
        user.should.be.an.instanceof(UsergridEntity)
        done()
    })
})

describe('entities', function() {
    it('should be an array of UsergridEntity objects', function() {
        _response.entities.should.be.an.Array()
        _response.entities.forEach(function(entity) {
            entity.should.be.an.instanceof(UsergridEntity)
        })
    })
})

describe('first, entity', function() {
    it('response.first should be a UsergridEntity object and have a valid uuid matching the first object in response.entities', function() {
        _response.first.should.be.an.instanceof(UsergridEntity).with.property('uuid').equal(_.first(_response.entities).uuid)
    })

    it('response.entity should be a reference to response.first', function() {
        _response.should.have.property('entity').deepEqual(_response.first)
    })
})

describe('last', function() {
    it('last should be a UsergridEntity object and have a valid uuid matching the last object in response.entities', function() {
        _response.last.should.be.an.instanceof(UsergridEntity).with.property('uuid').equal(_.last(_response.entities).uuid)
    })
})

describe('hasNextPage', function() {
    this.slow(_slow)
    this.timeout(_timeout)

    it('should be true when more entities exist', function(done) {
        client.GET(config.test.collection, function(err, usergridResponse) {
            usergridResponse.hasNextPage.should.be.true()
            done()
        })
    })

    it('should be false when no more entities exist', function(done) {
        client.GET('users', function(err, usergridResponse) {
            usergridResponse.metadata.count.should.be.lessThan(10)
            usergridResponse.hasNextPage.should.not.be.true()
            done()
        })
    })
})

describe('loadNextPage()', function() {
    this.slow(_slow + 800)
    this.timeout(_timeout + 2000)

    var firstResponse

    before(function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        var query = new UsergridQuery(config.test.collection).limit(10)

        client.GET(query, function(err, usergridResponse) {
            firstResponse = usergridResponse
            done()
        })
    })

    it('should load a new page of entities by passing an instance of UsergridClient', function(done) {
        firstResponse.loadNextPage(client, function(err, usergridResponse) {
            usergridResponse.first.uuid.should.not.equal(firstResponse.first.uuid)
            usergridResponse.entities.length.should.equal(10)
            done()
        })
    })
})