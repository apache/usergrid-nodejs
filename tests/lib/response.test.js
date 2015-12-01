'use strict'

var should = require('should'),
    config = require('../../config.json'),
    UsergridClient = require('../../lib/client'),
    UsergridEntity = require('../../lib/entity'),
    UsergridResponseError = require('../../lib/responseError'),
    _ = require('underscore')

var _collection = config.tests.collection
var client = new UsergridClient()

var _response

before(function(done) {

    this.slow(1000)
    this.timeout(6000)

    client.GET(_collection, function(err, usergridResponse) {
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

        client.GET(_collection, 'BADNAMEORUUID', function(err, usergridResponse) {
            usergridResponse.statusCode.should.not.equal(200)
            usergridResponse.error.should.be.an.instanceof(UsergridResponseError).with.keys(['name', 'description', 'exception'])
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

describe('first / entity', function() {
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