'use strict'

var should = require('should'),
    config = require('../../config.json'),
    UsergridClient = require('../../lib/client'),
    UsergridEntity = require('../../lib/entity')

var _collection = config.tests.collection
var client = new UsergridClient()

var _response, _uuid

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

describe('entities', function() {
    it('should be an array of UsergridEntity objects', function() {
        _response.entities.should.be.an.Array()
        _response.entities.forEach(function(entity) {
            entity.should.be.an.instanceof(UsergridEntity)
        })
    })
})

describe('first / entity', function() {
    it('response.first should be a UsergridEntity object and have a valid uuid', function(done) {
        _response.first.should.be.an.instanceof(UsergridEntity).with.property('uuid').with.a.lengthOf(36)
        _uuid = _response.first.uuid
        done()
    })

    it('response.entity should be a UsergridEntity object and have a valid uuid', function(done) {
        _response.entity.should.be.an.instanceof(UsergridEntity).with.property('uuid').with.a.lengthOf(36)
        _response.entity.uuid.should.equal(_uuid)
        done()
    })
})