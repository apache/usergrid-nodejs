'use strict'

var should = require('should'),
    urljoin = require('url-join'),
    config = require('../../helpers').config,
    UsergridClient = require('../../lib/client'),
    UsergridQuery = require('../../lib/query'),
    _ = require('lodash')

_.mixin(require('lodash-uuid'))

var _slow = 800,
    _timeout = 4000

describe('connect()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var response,
        entity1,
        entity2,
        client = new UsergridClient(),
        query = new UsergridQuery(config.test.collection).eq('name', 'testEntityConnectOne').or.eq('name', 'testEntityConnectTwo').asc('name')

    before(function(done) {
        // Create the entities we're going to use for connections
        client.POST(config.test.collection, [{
            "name": "testEntityConnectOne"
        }, {
            "name": "testEntityConnectTwo"
        }], function() {
            client.GET(query, function(err, usergridResponse) {
                response = usergridResponse
                entity1 = response.first
                entity2 = response.last
                done()
            })
        })
    })

    it('should connect entities by passing a target UsergridEntity object as a parameter', function(done) {
        var relationship = "foos"

        entity1.connect(relationship, entity2, function(err, usergridResponse) {
            usergridResponse.statusCode.should.equal(200)
            client.getConnections(client.connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.first.metadata.connecting[relationship].should.equal(urljoin(
                    "/",
                    config.test.collection,
                    entity1.uuid,
                    relationship,
                    entity2.uuid,
                    "connecting",
                    relationship
                ))
                done()
            })
        })
    })

    it('should connect entities by passing target uuid as a parameter', function(done) {
        var relationship = "bars"

        entity1.connect(relationship, entity2.uuid, function(err, usergridResponse) {
            usergridResponse.statusCode.should.equal(200)
            client.getConnections(client.connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.first.metadata.connecting[relationship].should.equal(urljoin(
                    "/",
                    config.test.collection,
                    entity1.uuid,
                    relationship,
                    entity2.uuid,
                    "connecting",
                    relationship
                ))
                done()
            })
        })
    })

    it('should connect entities by passing target type and name as parameters', function(done) {
        var relationship = "bazzes"

        entity1.connect(relationship, entity2.type, entity2.name, function(err, usergridResponse) {
            usergridResponse.statusCode.should.equal(200)
            client.getConnections(client.connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.first.metadata.connecting[relationship].should.equal(urljoin(
                    "/",
                    config.test.collection,
                    entity1.uuid,
                    relationship,
                    entity2.uuid,
                    "connecting",
                    relationship
                ))
                done()
            })
        })
    })

    it('should fail to connect entities when specifying target name without type', function() {
        should(function() {
            entity1.connect("fails", 'badName', function() {})
        }).throw()
    })
})

describe('getConnections()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var response,
        client = new UsergridClient(),
        query = new UsergridQuery(config.test.collection).eq('name', 'testEntityConnectOne').or.eq('name', 'testEntityConnectTwo').asc('name')

    before(function(done) {
        client.GET(query, function(err, usergridResponse) {
            response = usergridResponse
            done()
        })
    })

    it('should get an entity\'s outbound connections', function(done) {
        var entity1 = response.first
        var entity2 = response.last

        var relationship = "foos"

        entity1.getConnections(client.connections.DIRECTION_OUT, relationship, function(err, usergridResponse) {
            usergridResponse.first.metadata.connecting[relationship].should.equal(urljoin(
                "/",
                config.test.collection,
                entity1.uuid,
                relationship,
                entity2.uuid,
                "connecting",
                relationship
            ))
            done()
        })
    })

    it('should get an entity\'s inbound connections', function(done) {
        var entity1 = response.first
        var entity2 = response.last

        var relationship = "foos"

        entity2.getConnections(client.connections.DIRECTION_IN, relationship, function(err, usergridResponse) {
            usergridResponse.first.metadata.connections[relationship].should.equal(urljoin(
                "/",
                config.test.collection,
                entity2.uuid,
                "connecting",
                entity1.uuid,
                relationship
            ))
            done()
        })
    })
})

describe('disconnect()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var response,
        client = new UsergridClient(),
        query = new UsergridQuery(config.test.collection).eq('name', 'testEntityConnectOne').or.eq('name', 'testEntityConnectTwo').asc('name')

    before(function(done) {
        client.GET(query, function(err, usergridResponse) {
            response = usergridResponse
            done()
        })
    })

    it('should disconnect entities by passing a target UsergridEntity object as a parameter', function(done) {
        var entity1 = response.first
        var entity2 = response.last

        var relationship = "foos"

        entity1.disconnect(relationship, entity2, function(err, usergridResponse) {
            usergridResponse.statusCode.should.equal(200)
            client.getConnections(client.connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.entities.should.be.an.Array().with.lengthOf(0)
                done()
            })
        })
    })

    it('should disconnect entities by passing source type, source uuid, and target uuid as parameters', function(done) {
        var entity1 = response.first
        var entity2 = response.last

        var relationship = "bars"

        entity1.disconnect(relationship, entity2.uuid, function(err, usergridResponse) {
            usergridResponse.statusCode.should.equal(200)
            client.getConnections(client.connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.entities.should.be.an.Array().with.lengthOf(0)
                done()
            })
        })
    })

    it('should disconnect entities by passing target type and name as parameters', function(done) {
        var entity1 = response.first
        var entity2 = response.last

        var relationship = "bazzes"

        client.disconnect(entity1.type, entity1.name, relationship, entity2.type, entity2.name, function(err, usergridResponse) {
            usergridResponse.statusCode.should.equal(200)
            client.getConnections(client.connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.entities.should.be.an.Array().with.lengthOf(0)
                done()
            })
        })
    })

    it('should fail to disconnect entities when specifying target name without type', function() {
        var entity1 = response.first
        var entity2 = response.last

        should(function() {
            client.disconnect(entity1.type, entity1.name, "fails", entity2.name, function() {})
        }).throw()
    })
})