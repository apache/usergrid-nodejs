'use strict'

var should = require('should'),
    urljoin = require('url-join'),
    config = require('../../helpers').config,
    UsergridClient = require('../../lib/client'),
    UsergridEntity = require('../../lib/entity'),
    UsergridQuery = require('../../lib/query'),
    _ = require('lodash')

var _slow = 1500,
    _timeout = 4000

describe('putProperty()', function() {
    it('should set the value for a given key if the key does not exist', function() {
        var entity = new UsergridEntity('cat', 'Cosmo')
        entity.putProperty('foo', ['bar'])
        entity.should.have.property('foo').deepEqual(['bar'])
    })

    it('should overwrite the value for a given key if the key exists', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: 'baz'
        })
        entity.putProperty('foo', 'bar')
        entity.should.have.property('foo').deepEqual('bar')
    })

    it('should not be able to set the name key (name is immutable)', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: 'baz'
        })
        should(function() {
            entity.putProperty('name', 'Bazinga')
        }).throw()
    })
})

describe('putProperties()', function() {
    it('should set properties for a given object, overwriting properties that exist and creating those that don\'t', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: 'bar'
        })
        entity.putProperties({
            foo: 'baz',
            qux: 'quux',
            barray: [1, 2, 3, 4]
        })
        entity.should.containEql({
            type: 'cat',
            name: 'Cosmo',
            foo: 'baz',
            qux: 'quux',
            barray: [1, 2, 3, 4]
        })
    })

    it('should not be able to set properties for immutable keys', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: 'baz'
        })
        entity.putProperties({
            name: 'Bazinga',
            uuid: 'BadUuid',
            bar: 'qux'
        })
        entity.should.containEql({
            type: 'cat',
            name: 'Cosmo',
            bar: 'qux',
            foo: 'baz'
        })
    })
})

describe('removeProperty()', function() {
    it('should remove a given property if it exists', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: 'baz'
        })
        entity.removeProperty('foo')
        entity.should.not.have.property('foo')
    })

    it('should fail gracefully when removing an undefined property', function() {
        var entity = new UsergridEntity('cat', 'Cosmo')
        entity.removeProperty('foo')
        entity.should.not.have.property('foo')
    })
})

describe('removeProperties()', function() {
    it('should remove an array of properties for a given object, failing gracefully for undefined properties', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: 'bar',
            baz: 'qux'
        })
        entity.removeProperties(['foo', 'baz'])
        entity.should.containEql({
            type: 'cat',
            name: 'Cosmo'
        })
    })
})

describe('insert()', function() {
    it('should insert a single value into an existing array at the specified index', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: [1, 2, 3, 5, 6]
        })
        entity.insert('foo', 4, 3)
        entity.should.have.property('foo').deepEqual([1, 2, 3, 4, 5, 6])
    })

    it('should merge an array of values into an existing array at the specified index', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: [1, 2, 3, 7, 8]
        })
        entity.insert('foo', [4, 5, 6], 3)
        entity.should.have.property('foo').deepEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('should convert an existing value into an array when inserting a second value', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: 'bar'
        })
        entity.insert('foo', 'baz', 1)
        entity.should.have.property('foo').deepEqual(['bar', 'baz'])
    })

    it('should create a new array when a property does not exist', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo'
        })
        entity.insert('foo', 'bar', 1000)
        entity.should.have.property('foo').deepEqual(['bar'])
    })

    it('should gracefully handle indexes out of range', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: ['bar']
        })
        entity.insert('foo', 'baz', 1000)
        entity.should.have.property('foo').deepEqual(['bar', 'baz'])
        entity.insert('foo', 'qux', -1000)
        entity.should.have.property('foo').deepEqual(['qux', 'bar', 'baz'])
    })
})

describe('append()', function() {
    it('should append a value to the end of an existing array', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: [1, 2, 3]
        })
        entity.append('foo', 4)
        entity.should.have.property('foo').deepEqual([1, 2, 3, 4])
    })

    it('should create a new array if a property does not exist', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo'
        })
        entity.append('foo', 'bar')
        entity.should.have.property('foo').deepEqual(['bar'])
    })
})

describe('prepend()', function() {
    it('should prepend a value to the beginning of an existing array', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: [1, 2, 3]
        })
        entity.prepend('foo', 0)
        entity.should.have.property('foo').deepEqual([0, 1, 2, 3])
    })

    it('should create a new array if a property does not exist', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo'
        })
        entity.prepend('foo', 'bar')
        entity.should.have.property('foo').deepEqual(['bar'])
    })
})

describe('pop()', function() {
    it('should remove the last value of an existing array', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: [1, 2, 3]
        })
        entity.pop('foo')
        entity.should.have.property('foo').deepEqual([1, 2])
    })

    it('value should remain unchanged if it is not an array', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: 'bar'
        })
        entity.pop('foo')
        entity.should.have.property('foo').deepEqual('bar')
    })

    it('should gracefully handle empty arrays', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: []
        })
        entity.pop('foo')
        entity.should.have.property('foo').deepEqual([])
    })
})

describe('shift()', function() {
    it('should remove the first value of an existing array', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: [1, 2, 3]
        })
        entity.shift('foo')
        entity.should.have.property('foo').deepEqual([2, 3])
    })

    it('value should remain unchanged if it is not an array', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: 'bar'
        })
        entity.shift('foo')
        entity.should.have.property('foo').deepEqual('bar')
    })

    it('should gracefully handle empty arrays', function() {
        var entity = new UsergridEntity({
            type: 'cat',
            name: 'Cosmo',
            foo: []
        })
        entity.shift('foo')
        entity.should.have.property('foo').deepEqual([])
    })
})

describe('reload()', function() {

    this.slow(_slow + 1000)
    this.timeout(_timeout + 4000)

    it('should refresh an entity with the latest server copy of itself using the Usergrid shared instance', function(done) {
        var client = new UsergridClient(config),
            now = Date.now()
        client.GET(config.test.collection, function(err, getResponse) {
            var entity = new UsergridEntity(getResponse.first)
            var modified = entity.modified
            getResponse.first.putProperty('reloadSingletonTest', now)
            client.PUT(getResponse.first, function(err, putResponse) {
                entity.reload(function() {
                    entity.reloadSingletonTest.should.equal(now)
                    entity.modified.should.not.equal(modified)
                    done()
                })
            })
        })
    })

    it('should refresh an entity with the latest server copy of itself by passing an instance of UsergridClient', function(done) {
        var client = new UsergridClient(config),
            now = Date.now()
        client.GET(config.test.collection, function(err, getResponse) {
            var entity = new UsergridEntity(getResponse.first)
            var modified = entity.modified
            getResponse.first.putProperty('reloadTest', now)
            client.PUT(getResponse.first, function(err, putResponse) {
                entity.reload(client, function() {
                    entity.reloadTest.should.equal(now)
                    entity.modified.should.not.equal(modified)
                    done()
                })
            })
        })
    })
})

describe('save()', function() {

    this.slow(_slow + 1000)
    this.timeout(_timeout + 4000)

    it('should save an updated entity to the server using the Usergrid shared instance', function(done) {
        var client = new UsergridClient(config),
            now = Date.now()
        client.GET(config.test.collection, function(err, getResponse) {
            var entity = new UsergridEntity(getResponse.first)
            entity.putProperty('saveSingletonTest', now)
            entity.save(function() {
                entity.saveSingletonTest.should.equal(now)
                done()
            })
        })
    })

    it('should save an updated entity to the server by passing an instance of UsergridClient', function(done) {
        var client = new UsergridClient(config),
            now = Date.now()
        client.GET(config.test.collection, function(err, getResponse) {
            var entity = new UsergridEntity(getResponse.first)
            entity.putProperty('saveTest', now)
            entity.save(client, function() {
                entity.saveTest.should.equal(now)
                done()
            })
        })
    })
})

describe('remove()', function() {

    this.slow(_slow + 1000)
    this.timeout(_timeout + 4000)

    it('should remove an entity from the server using the Usergrid shared instance', function(done) {
        var client = new UsergridClient(config)
        client.POST(config.test.collection, {
            removeSingletonTest: 'test'
        }, function(err, postResponse) {
            var entity = new UsergridEntity(postResponse.first)
            entity.remove(function(err, deleteResponse) {
                deleteResponse.statusCode.should.equal(200)
                    // best practice is to delete the entity object here, because it no longer exists on the server
                entity = null
                done()
            })
        })
    })

    it('should remove an entity from the server by passing an instance of UsergridClient', function(done) {
        var client = new UsergridClient(config)
        client.POST(config.test.collection, {
            removeTest: 'test'
        }, function(err, postResponse) {
            var entity = new UsergridEntity(postResponse.first)
            entity.remove(client, function(err, deleteResponse) {
                deleteResponse.statusCode.should.equal(200)
                // best practice is to delete the entity object here, because it no longer exists on the server
                entity = null
                done()
            })
        })
    })
})

describe('connect()', function() {

    this.slow(_slow)
    this.timeout(_timeout + 4000)

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
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
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
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
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
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
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
    this.timeout(_timeout + 4000)

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

        entity1.getConnections(UsergridClient.Connections.DIRECTION_OUT, relationship, function(err, usergridResponse) {
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

        entity2.getConnections(UsergridClient.Connections.DIRECTION_IN, relationship, function(err, usergridResponse) {
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
    this.timeout(_timeout + 4000)

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

        entity1.disconnect(relationship, entity2.uuid, function(err, usergridResponse) {
            usergridResponse.statusCode.should.equal(200)
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
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
            client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
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