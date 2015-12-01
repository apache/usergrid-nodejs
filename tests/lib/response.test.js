'use strict'

var should = require('should'),
    config = require('../../config.json'),
    UsergridClient = require('../../lib/client'),
    UsergridEntity = require('../../lib/entity'),
    UsergridUser = require('../../lib/user'),
    UsergridResponseError = require('../../lib/responseError'),
    _ = require('underscore')

var client = new UsergridClient()

var _response

before(function(done) {

    this.slow(1000)
    this.timeout(6000)

    client.GET(config.tests.collection, function(err, usergridResponse) {
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

describe('metadata', function() {
    it('should be a read-only object', function() {
        _response.metadata.should.be.an.Object()
        Object.isFrozen(_response.metadata).should.be.ok
        should(function() {
            _response.metadata.uri = 'TEST'
        }).throw()
    })
})

describe('error', function() {
    it('should be a UsergridResponseError object', function(done) {

        this.slow(1000)
        this.timeout(6000)

        client.GET(config.tests.collection, 'BADNAMEORUUID', function(err, usergridResponse) {
            usergridResponse.error.should.be.an.instanceof(UsergridResponseError)
            done()
        })
    })
})

describe('users', function() {

    this.slow(1000)
    this.timeout(6000)

    it('response.users should be an array of UsergridUser objects', function(done) {
        client.GET('users', function(err, usergridResponse) {
            usergridResponse.users.should.be.an.Array()
            usergridResponse.users.forEach(function(user) {
                user.should.be.an.instanceof(UsergridUser)
            })
            done()
        })
    })
})

describe('user', function() {

    this.slow(1000)
    this.timeout(6000)

    it('response.user should be a UsergridUser object and have a valid uuid matching the first object in response.users', function(done) {
        client.GET('users', function(err, usergridResponse) {
            usergridResponse.user.should.be.an.instanceof(UsergridUser).with.property('uuid').equal(_.first(usergridResponse.users).uuid)
            done()
        })
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
        _response.entity.should.deepEqual(_response.first)
    })
})

describe('last', function() {
    it('response.last should be a UsergridEntity object and have a valid uuid matching the last object in response.entities', function() {
        _response.last.should.be.an.instanceof(UsergridEntity).with.property('uuid').equal(_.last(_response.entities).uuid)
    })
})