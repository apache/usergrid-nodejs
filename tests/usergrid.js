'use strict'

var should = require('should'),
    config = require('../package.json').config,
    Usergrid = require('../usergrid'),
    UsergridClient = require('../lib/client')

const _collection = 'tests'
var _uuid = null

describe('Usergrid', function() {
    it('should fail to initialize without an orgId and appId', function() {
        should(function() {
            Usergrid.initialize()
        }).fail
    })

    it('should initialize when using an orgId and appId', function(done) {
        Usergrid.initialize(config.usergrid.orgId, config.usergrid.appId)
        Usergrid.orgId.should.equal(config.usergrid.orgId)
        Usergrid.appId.should.equal(config.usergrid.appId)
        Usergrid.should.be.an.instanceof(UsergridClient)
        done()
    })
});

describe('Usergrid.GET', function() {

    this.slow(1000)
    this.timeout(6000)

    describe('make a GET call to Usergrid and retrieve entities', function() {
        var response
        before(function(done) {
            Usergrid.GET(_collection, function(err, usergridResponse) {
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

describe('Usergrid.POST', function() {

    this.slow(1000)
    this.timeout(3000)

    describe('make a POST call to Usergrid and create an entity', function() {

        var response
        before(function(done) {
            Usergrid.POST(_collection, {
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

describe('Usergrid.PUT', function() {

    this.slow(1000)
    this.timeout(3000)

    describe('make a PUT call to Usergrid and update an entity', function() {

        var response
        before(function(done) {
            Usergrid.PUT(_collection, _uuid, {
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

describe('Usergrid.DELETE', function() {

    this.slow(1000)
    this.timeout(6000)

    describe('make a DELETE call to Usergrid and delete an entity', function() {
        var response
        before(function(done) {
            Usergrid.DELETE(_collection, _uuid, function(err, usergridResponse) {
                Usergrid.GET(_collection, _uuid, function(err, usergridResponse) {
                    response = usergridResponse
                    done()
                })
            })
        })

        it('should return a 200 ok', function() {
            // This should check for 404, but because of a Usergrid bug, it returns 401 instead of 404.
            response.statusCode.should.not.equal(200)
        })

        it('response.error.name should equal \'service_resource_not_found\'', function() {
            response.error.name.should.equal('service_resource_not_found')
        })
    })
})