'use strict'

var should = require('should'),
    urljoin = require('url-join'),
    config = require('../../helpers').config,
    UsergridClient = require('../../lib/client'),
    UsergridEntity = require('../../lib/entity'),
    UsergridQuery = require('../../lib/query'),
    _ = require('lodash')

var _uuid,
    _slow = 500,
    _timeout = 4000

describe('connect()', function() {

    this.slow(_slow + 1000)
    this.timeout(_timeout + 4000)

    var response,
        entity1,
        entity2,
        client = new UsergridClient(),
        query = new UsergridQuery(config.test.collection).eq('name', 'testClientConnectOne').or.eq('name', 'testClientConnectTwo').asc('name')

    before(function(done) {
        // Create the entities we're going to use for connections
        client.POST(config.test.collection, [{
            "name": "testClientConnectOne"
        }, {
            "name": "testClientConnectTwo"
        }], function() {
            client.GET(query, function(err, usergridResponse) {
                response = usergridResponse
                entity1 = response.first
                entity2 = response.last
                done()
            })
        })
    })

    it('should connect entities by passing UsergridEntity objects as parameters', function(done) {
        var relationship = "foos"

        client.connect(entity1, relationship, entity2, function(err, usergridResponse) {
            usergridResponse.ok.should.be.true()
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.first.metadata.connecting[relationship].should.equal(urljoin(
                    "",
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

    it('should connect entities by passing a source UsergridEntity object and a target uuid', function(done) {
        var relationship = "bars"

        client.connect(entity1, relationship, entity2.uuid, function(err, usergridResponse) {
            usergridResponse.ok.should.be.true()
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.first.metadata.connecting[relationship].should.equal(urljoin(
                    "",
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

    it('should connect entities by passing source type, source uuid, and target uuid as parameters', function(done) {
        var relationship = "bazzes"

        client.connect(entity1.type, entity1.uuid, relationship, entity2.uuid, function(err, usergridResponse) {
            usergridResponse.ok.should.be.true()
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.first.metadata.connecting[relationship].should.equal(urljoin(
                    "",
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

    it('should connect entities by passing source type, source name, target type, and target name as parameters', function(done) {
        var relationship = "quxes"

        client.connect(entity1.type, entity1.name, relationship, entity2.type, entity2.name, function(err, usergridResponse) {
            usergridResponse.ok.should.be.true()
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.first.metadata.connecting[relationship].should.equal(urljoin(
                    "",
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

    it('should connect entities by passing a preconfigured options object', function(done) {
        var options = {
            entity: entity1,
            relationship: "quuxes",
            to: entity2
        }

        client.connect(options, function(err, usergridResponse) {
            usergridResponse.ok.should.be.true()
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, options.relationship, function(err, usergridResponse) {
                usergridResponse.first.metadata.connecting[options.relationship].should.equal(urljoin(
                    "",
                    config.test.collection,
                    entity1.uuid,
                    options.relationship,
                    entity2.uuid,
                    "connecting",
                    options.relationship
                ))
                done()
            })
        })
    })

    it('should fail to connect entities when specifying target name without type', function() {
        should(function() {
            client.connect(entity1.type, entity1.name, "fails", 'badName', function() {})
        }).throw()
    })
})

describe('getConnections()', function() {

    this.slow(_slow + 1000)
    this.timeout(_timeout + 4000)

    var response,
        client = new UsergridClient(),
        query = new UsergridQuery(config.test.collection).eq('name', 'testClientConnectOne').or.eq('name', 'testClientConnectTwo').asc('name')

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

        client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
            usergridResponse.first.metadata.connecting[relationship].should.equal(urljoin(
                "",
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

        client.getConnections(UsergridClient.Connections.DIRECTION_IN, entity2, relationship, function(err, usergridResponse) {
            usergridResponse.first.metadata.connections[relationship].should.equal(urljoin(
                "",
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

    this.slow(_slow + 1000)
    this.timeout(_timeout + 4000)

    var response,
        client = new UsergridClient(),
        query = new UsergridQuery(config.test.collection).eq('name', 'testClientConnectOne').or.eq('name', 'testClientConnectTwo').asc('name')

    before(function(done) {
        client.GET(query, function(err, usergridResponse) {
            response = usergridResponse
            done()
        })
    })

    it('should disconnect entities by passing UsergridEntity objects as parameters', function(done) {
        var entity1 = response.first
        var entity2 = response.last

        var relationship = "foos"

        client.disconnect(entity1, relationship, entity2, function(err, usergridResponse) {
            usergridResponse.ok.should.be.true()
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.entities.should.be.an.Array().with.lengthOf(0)
                done()
            })
        })
    })

    it('should disconnect entities by passing source type, source uuid, and target uuid as parameters', function(done) {
        var entity1 = response.first
        var entity2 = response.last

        var relationship = "bars"

        client.disconnect(entity1.type, entity1.uuid, relationship, entity2.uuid, function(err, usergridResponse) {
            usergridResponse.ok.should.be.true()
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.entities.should.be.an.Array().with.lengthOf(0)
                done()
            })
        })
    })

    it('should disconnect entities by passing source type, source name, target type, and target name as parameters', function(done) {
        var entity1 = response.first
        var entity2 = response.last

        var relationship = "bazzes"

        client.disconnect(entity1.type, entity1.name, relationship, entity2.type, entity2.name, function(err, usergridResponse) {
            usergridResponse.ok.should.be.true()
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
                usergridResponse.entities.should.be.an.Array().with.lengthOf(0)
                done()
            })
        })
    })

    it('should disconnect entities by passing a preconfigured options object', function(done) {
        var entity1 = response.first
        var entity2 = response.last

        var options = {
            entity: entity1,
            relationship: "quxes",
            to: entity2
        }

        client.disconnect(options, function(err, usergridResponse) {
            usergridResponse.ok.should.be.true()
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, options.relationship, function(err, usergridResponse) {
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