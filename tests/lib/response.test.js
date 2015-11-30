'use strict'

var should = require('should'),
    config = require('../../config.json'),
    UsergridClient = require('../../lib/client'),
    UsergridEntity = require('../../lib/entity')

var _collection = config.tests.collection
var client = new UsergridClient()

var _response, _uuid

before(function(done) {
    client.GET(_collection, function(err, usergridResponse) {
        _response = usergridResponse
        done()
    })
})

describe('headers', function() {

    this.slow(1000)
    this.timeout(6000)

    it('should be an object', function(done) {
        // client.GET(_collection, function(err, usergridResponse) {
            _response.headers.should.be.an.Object().with.property('content-type')
            // done()
        // })
    })
})

describe('statusCode', function() {

    this.slow(1000)
    this.timeout(6000)

    it('should be a number', function(done) {
        client.GET(_collection, function(err, usergridResponse) {
            usergridResponse.statusCode.should.be.a.Number()
            done()
        })
    })
})

describe('statusCode', function() {

    this.slow(1000)
    this.timeout(6000)

    it('should be a number', function(done) {
        client.GET(_collection, function(err, usergridResponse) {
            usergridResponse.statusCode.should.be.a.Number()
            done()
        })
    })
})

describe('entities', function() {

    this.slow(1000)
    this.timeout(6000)

    it('should be an array of UsergridEntity objects', function(done) {
        client.GET(_collection, function(err, usergridResponse) {
            usergridResponse.entities.should.be.an.Array()
            usergridResponse.entities.forEach(function(entity) {
                entity.should.be.an.instanceof(UsergridEntity)
            })
            done()
        })
    })
})

describe('first / entity', function() {

    this.slow(1000)
    this.timeout(6000)

    it('response.first should be a UsergridEntity object and have a valid uuid', function(done) {
        response.first.should.be.an.instanceof(UsergridEntity).with.property('uuid').with.a.lengthOf(36)
        uuid = response.first.uuid
        done()
    })

    it('response.entity should be a UsergridEntity object and have a valid uuid', function(done) {
        response.entity.should.be.an.instanceof(UsergridEntity).with.property('uuid').with.a.lengthOf(36)
        response.entity.uuid.should.equal(uuid)
        done()
    })
})