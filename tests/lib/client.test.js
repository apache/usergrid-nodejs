'use strict'

var should = require('should'),
    urljoin = require('url-join'),
    config = require('../../helpers').config,
    UsergridClient = require('../../lib/client'),
    UsergridEntity = require('../../lib/entity'),
    UsergridQuery = require('../../lib/query'),
    UsergridAuth = require('../../lib/auth'),
    UsergridAppAuth = require('../../lib/appAuth'),
    _ = require('lodash')

_.mixin(require('lodash-uuid'))

var _uuid,
    _slow = 500,
    _timeout = 4000

describe('initialization', function() {
    it('should fail to initialize without an orgId and appId', function() {
        should(function() {
            var client = new UsergridClient(null, null)
            client.GET()
        }).throw()
    })

    it('should initialize using properties defined in config.json', function() {
        var client = new UsergridClient()
        client.should.be.an.instanceof(UsergridClient).with.property('orgId').equal(config.orgId)
        client.should.be.an.instanceof(UsergridClient).with.property('appId').equal(config.appId)
    })

    it('should initialize when passing orgId and appId as arguments, taking precedence over config', function() {
        var client = new UsergridClient('foo', 'bar')
        client.should.be.an.instanceof(UsergridClient).with.property('orgId').equal('foo')
        client.should.be.an.instanceof(UsergridClient).with.property('appId').equal('bar')
    })

    it('should initialize when passing an object containing orgId and appId, taking precedence over config', function() {
        var client = new UsergridClient({
            orgId: 'foo',
            appId: 'bar'
        })
        client.should.be.an.instanceof(UsergridClient).with.property('orgId').equal('foo')
        client.should.be.an.instanceof(UsergridClient).with.property('appId').equal('bar')
    })
})

describe('GET()', function() {
    this.slow(_slow)
    this.timeout(_timeout)

    var response, client, query
    before(function(done) {
        client = new UsergridClient(config)
        client.GET(config.test.collection, function(err, usergridResponse) {
            response = usergridResponse
            done()
        })
    })

    it('should not fail when a callback function is not passed', function() {
        // note: this test will NOT fail gracefully inside the Mocha event chain
        client.GET(config.test.collection)
    })

    it('should return a 200 ok', function() {
        response.statusCode.should.equal(200)
    })

    it('response.entities should be an array', function() {
        response.entities.should.be.an.Array()
    })

    it('response.first should exist and have a valid uuid', function() {
        response.first.should.be.an.Object().with.property('uuid').with.a.lengthOf(36)
    })

    it('response.entity should exist and have a valid uuid', function() {
        response.entity.should.be.an.Object().with.property('uuid').with.a.lengthOf(36)
    })

    it('response.last should exist and have a valid uuid', function() {
        response.last.should.be.an.Object().with.property('uuid').with.a.lengthOf(36)
    })

    it('each entity should match the search criteria when passing a UsergridQuery object', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        client = new UsergridClient(config)
        query = new UsergridQuery(config.test.collection).eq('color', 'black')

        client.GET(query, function(err, usergridResponse) {
            usergridResponse.entities.forEach(function(entity) {
                entity.should.be.an.Object().with.property('color').equal('black')
            })
            done()
        })
    })
})

describe('POST()', function() {

    this.slow(_slow)
    this.timeout(3000)

    var response, client
    before(function(done) {
        client = new UsergridClient()
        client.POST(config.test.collection, {
            author: 'Sir Arthur Conan Doyle'
        }, function(err, usergridResponse) {
            response = usergridResponse
            _uuid = usergridResponse.entity.uuid
            done()
        })
    })

    it('should not fail when a callback function is not passed', function() {
        // note: this test will NOT fail gracefully inside the Mocha event chain
        client.POST(config.test.collection, {})
    })

    it('should return a 200 ok', function() {
        response.statusCode.should.equal(200)
    })

    it('response.entities should be an array', function() {
        response.entities.should.be.an.Array().with.a.lengthOf(1)
    })

    it('response.entity should exist and have a valid uuid', function() {
        response.entity.should.be.an.Object().with.property('uuid').with.a.lengthOf(36)
    })

    it('response.entity.author should equal "Sir Arthur Conan Doyle"', function() {
        response.entity.should.have.property('author').equal('Sir Arthur Conan Doyle')
    })

    it('should support creating an entity by passing a UsergridEntity object', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        var entity = new UsergridEntity({
            type: config.test.collection,
            restaurant: "Dino's Deep Dish",
            cuisine: "pizza"
        })

        client.POST(entity, function(err, usergridResponse) {
            usergridResponse.entity.should.be.an.Object().with.property('restaurant').equal(entity.restaurant)
            done()
        })
    })

    it('should support creating an entity by passing type and a body object', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        client.POST(config.test.collection, {
            restaurant: "Dino's Deep Dish",
            cuisine: "pizza"
        }, function(err, usergridResponse) {
            usergridResponse.entity.should.be.an.Object().with.property('restaurant').equal("Dino's Deep Dish")
            done()
        })
    })

    it('should support creating an entity by passing a body object that includes type', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        client.POST({
            type: config.test.collection,
            restaurant: "Dino's Deep Dish",
            cuisine: "pizza"
        }, function(err, usergridResponse) {
            usergridResponse.entity.should.be.an.Object().with.property('restaurant').equal("Dino's Deep Dish")
            done()
        })
    })

    it('should support creating an entity by passing an array of UsergridEntity objects', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        var entities = [
            new UsergridEntity({
                type: config.test.collection,
                restaurant: "Dino's Deep Dish",
                cuisine: "pizza"
            }), new UsergridEntity({
                type: config.test.collection,
                restaurant: "Chipotle",
                cuisine: "mexican"
            })
        ]

        client.POST(entities, function(err, usergridResponse) {
            usergridResponse.entities.forEach(function(entity) {
                entity.should.be.an.Object().with.property('restaurant').equal(entity.restaurant)
            })
            done()
        })
    })

    it('should support creating an entity by passing a preformatted POST builder object', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        var options = {
            type: config.test.collection,
            body: {
                restaurant: "Chipotle",
                cuisine: "mexican"
            }
        }

        client.POST(options, function(err, usergridResponse) {
            usergridResponse.entities.forEach(function(entity) {
                entity.should.be.an.Object().with.property('restaurant').equal(entity.restaurant)
            })
            done()
        })
    })
})

describe('PUT()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var response, client
    before(function(done) {
        client = new UsergridClient()
        client.PUT(config.test.collection, _uuid, {
            narrator: 'Peter Doyle'
        }, function(err, usergridResponse) {
            response = usergridResponse
            done()
        })
    })

    it('should not fail when a callback function is not passed', function() {
        // note: this test will NOT fail gracefully inside the Mocha event chain
        client.PUT(config.test.collection, _uuid, {})
    })

    it('should return a 200 ok', function() {
        response.statusCode.should.equal(200)
    })

    it('response.entities should be an array with a single entity', function() {
        response.entities.should.be.an.Array().with.a.lengthOf(1)
    })

    it('response.entity should exist and its uuid should the uuid from the previous POST request', function() {
        response.entity.should.be.an.Object().with.property('uuid').equal(_uuid)
    })

    it('response.entity.narrator should be updated to "Peter Doyle"', function() {
        response.entity.should.have.property('narrator').equal('Peter Doyle')
    })

    it('should create a new entity when no uuid or name is passed', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        var newEntity = new UsergridEntity({
            type: config.test.collection,
            author: 'Frank Mills'
        })

        client.PUT(newEntity, function(err, usergridResponse) {
            usergridResponse.entity.should.be.an.Object()
            usergridResponse.entity.should.have.property('uuid').with.a.lengthOf(36)
            usergridResponse.entity.should.have.property('author').equal('Frank Mills')
            usergridResponse.entity.created.should.equal(usergridResponse.entity.modified)
            done()
        })
    })

    it('should support updating the entity by passing a UsergridEntity object', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        var updateEntity = _.assign(response.entity, {
            publisher: {
                name: "George Newns",
                date: "14 October 1892",
                country: "United Kingdom"
            }
        })

        client.PUT(updateEntity, function(err, usergridResponse) {
            usergridResponse.entity.should.be.an.Object().with.property('publisher').deepEqual(updateEntity.publisher)
            done()
        })
    })

    it('should support updating an entity by passing type and a body object', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        client.PUT(config.test.collection, {
            uuid: response.entity.uuid,
            updateByPassingTypeAndBody: true
        }, function(err, usergridResponse) {
            usergridResponse.entity.should.be.an.Object().with.property('updateByPassingTypeAndBody').equal(true)
            done()
        })
    })

    it('should support updating an entity by passing a body object that includes type', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        client.PUT(config.test.collection, {
            type: config.test.collection,
            uuid: response.entity.uuid,
            updateByPassingBodyIncludingType: true
        }, function(err, usergridResponse) {
            usergridResponse.entity.should.be.an.Object().with.property('updateByPassingBodyIncludingType').equal(true)
            done()
        })
    })

    it('should support updating a set of entities by passing an UsergridQuery object', function(done) {

        this.slow(_slow + 1000)
        this.timeout(_timeout + 4000)

        var query = new UsergridQuery(config.test.collection).eq('cuisine', 'pizza').limit(2)
        var body = {
            testUuid: _.uuid()
        }

        client.PUT(query, body, function(err, usergridResponse) {
            usergridResponse.entities.forEach(function(entity) {
                entity.should.be.an.Object().with.property('testUuid').equal(body.testUuid)
            })
            done()
        })
    })

    it('should support updating an entity by passing a preformatted PUT builder object', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        var options = {
            uuidOrName: response.entity.uuid,
            type: config.test.collection,
            body: {
                relatedUuid: _.uuid()
            }
        }

        client.PUT(options, function(err, usergridResponse) {
            usergridResponse.entity.should.be.an.Object().with.property('relatedUuid').equal(options.body.relatedUuid)
            done()
        })
    })
})

describe('DELETE()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var response, client
    before(function(done) {
        client = new UsergridClient()
        client.DELETE(config.test.collection, _uuid, function() {
            client.GET(config.test.collection, _uuid, function(err, usergridResponse) {
                response = usergridResponse
                done()
            })
        })
    })

    it('should not fail when a callback function is not passed', function() {
        // note: this test will NOT fail gracefully inside the Mocha event chain
        client.DELETE(config.test.collection, _uuid)
    })

    if (config.target === '1.0') {
        // This should check for 404, but because of a Usergrid 1.0 bug, 401 instead of 404.
        // see https://issues.apache.org/jira/browse/USERGRID-1128
        it('should return a 4XX status code', function() {
            response.statusCode.should.be.greaterThanOrEqual(401)
        })
    } else {
        it('should return a 404 not found', function() {
            response.statusCode.should.equal(404)
        })
    }

    if (config.target === '1.0') {
        it('response.error.name should equal "service_resource_not_found"', function() {
            response.error.name.should.equal('service_resource_not_found')
        })
    } else {
        it('response.error.name should equal "entity_not_found"', function() {
            response.error.name.should.equal('entity_not_found')
        })
    }

    it('should support deleting an entity by passing a UsergridEntity object', function(done) {

        this.slow(_slow + 1000)
        this.timeout(_timeout + 1000)

        var entity = new UsergridEntity({
            type: config.test.collection,
            command: "CTRL+ALT+DEL"
        })

        client.POST(entity, function(err, usergridResponse) {
            client.DELETE(usergridResponse.entity, function() {
                client.GET(config.test.collection, usergridResponse.entity.uuid, function(err, delResponse) {
                    delResponse.error.name.should.equal((config.target === '1.0') ? 'service_resource_not_found' : 'entity_not_found')
                    done()
                })
            })
        })
    })

    it('should support deleting an entity by passing type and uuid', function(done) {

        this.slow(_slow + 1000)
        this.timeout(_timeout + 1000)

        var body = {
            command: "CTRL+ALT+DEL"
        }

        client.POST(config.test.collection, body, function(err, usergridResponse) {
            client.DELETE(config.test.collection, usergridResponse.entity.uuid, function() {
                client.GET(config.test.collection, usergridResponse.entity.uuid, function(err, delResponse) {
                    delResponse.error.name.should.equal((config.target === '1.0') ? 'service_resource_not_found' : 'entity_not_found')
                    done()
                })
            })
        })
    })

    it('should support deleting multiple entities by passing a UsergridQuery object', function(done) {

        this.slow(_slow + 1000)
        this.timeout(_timeout + 4000)

        var entity = new UsergridEntity({
            type: config.test.collection,
            command: "CMD+TAB"
        })

        var query = new UsergridQuery(config.test.collection).eq('command', 'CMD+TAB')

        client.POST([entity, entity, entity, entity], function() {
            client.DELETE(query, function() {
                client.GET(query, function(err, usergridResponse) {
                    usergridResponse.entities.should.be.an.Array().with.lengthOf(0)
                    done()
                })
            })
        })
    })

    it('should support deleting an entity by passing a preformatted DELETE builder object', function(done) {

        this.slow(_slow + 1000)
        this.timeout(_timeout + 1000)

        var options = {
            type: config.test.collection,
            body: {
                restaurant: "IHOP",
                cuisine: "breakfast"
            }
        }

        client.POST(options, function(err, usergridResponse) {
            client.DELETE(_.assign(options, {
                uuid: usergridResponse.entity.uuid
            }), function() {
                client.GET(config.test.collection, usergridResponse.entity.uuid, function(err, delResponse) {
                    delResponse.error.name.should.equal((config.target === '1.0') ? 'service_resource_not_found' : 'entity_not_found')
                    done()
                })
            })
        })
    })
})

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

    it('should connect entities by passing a source UsergridEntity object and a target uuid', function(done) {
        var relationship = "bars"

        client.connect(entity1, relationship, entity2.uuid, function(err, usergridResponse) {
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

    it('should connect entities by passing source type, source uuid, and target uuid as parameters', function(done) {
        var relationship = "bazzes"

        client.connect(entity1.type, entity1.uuid, relationship, entity2.uuid, function(err, usergridResponse) {
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

    it('should connect entities by passing source type, source name, target type, and target name as parameters', function(done) {
        var relationship = "quxes"

        client.connect(entity1.type, entity1.name, relationship, entity2.type, entity2.name, function(err, usergridResponse) {
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

    it('should connect entities by passing a preconfigured options object', function(done) {
        var options = {
            entity: entity1,
            relationship: "quuxes",
            to: entity2
        }

        client.connect(options, function(err, usergridResponse) {
            usergridResponse.statusCode.should.equal(200)
            client.getConnections(client.connections.DIRECTION_OUT, entity1, options.relationship, function(err, usergridResponse) {
                usergridResponse.first.metadata.connecting[options.relationship].should.equal(urljoin(
                    "/",
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

    it('should get an entity\'s inbound connections', function(done) {
        var entity1 = response.first
        var entity2 = response.last

        var relationship = "foos"

        client.getConnections(client.connections.DIRECTION_IN, entity2, relationship, function(err, usergridResponse) {
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

        client.disconnect(entity1.type, entity1.uuid, relationship, entity2.uuid, function(err, usergridResponse) {
            usergridResponse.statusCode.should.equal(200)
            client.getConnections(client.connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
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
            usergridResponse.statusCode.should.equal(200)
            client.getConnections(client.connections.DIRECTION_OUT, entity1, relationship, function(err, usergridResponse) {
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
            usergridResponse.statusCode.should.equal(200)
            client.getConnections(client.connections.DIRECTION_OUT, entity1, options.relationship, function(err, usergridResponse) {
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

describe('authenticateApp()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var response, token, client = new UsergridClient()
    before(function(done) {
        client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl)
        client.authenticateApp(function(err, r, t) {
            response = r
            token = t
            done()
        })
    })

    it('should fail when called without a clientId and clientSecret', function() {
        should(function() {
            var client = new UsergridClient()
            client.setAppAuth(undefined, undefined, 0)
            client.authenticateApp()
        }).throw()
    })

    it('should not set client.appAuth when authenticating with a bad UsergridAppAuth instance (using an object)', function(done) {
        var failClient = new UsergridClient()
        failClient.authenticateApp(new UsergridAppAuth({
            clientId: 'BADCLIENTID',
            clientSecret: 'BADCLIENTSECRET'
        }), function(e, r, token) {
            should(token).be.undefined()
            should(failClient.appAuth).be.undefined()
            done()
        })
    })

    it('should not set client.appAuth when authenticating with a bad UsergridAppAuth instance (using arguments)', function(done) {
        var failClient = new UsergridClient()
        failClient.authenticateApp(new UsergridAppAuth('BADCLIENTID', 'BADCLIENTSECRET'), function(e, r, token) {
            should(token).be.undefined()
            should(failClient.appAuth).be.undefined()
            done()
        })
    })

    it('should return a 200 ok', function() {
        response.statusCode.should.equal(200)
    })

    it('should have a valid token', function() {
        token.should.be.a.String()
        token.length.should.be.greaterThan(10)
    })

    it('client.appAuth.token should be set to the token returned from Usergrid', function() {
        client.appAuth.should.have.property('token').equal(token)
    })

    it('client.appAuth.isValid should be true', function() {
        client.appAuth.should.have.property('isValid').which.is.true()
    })

    it('client.appAuth.expiry should be set to a future date', function() {
        client.appAuth.should.have.property('expiry').greaterThan(Date.now())
    })
})

describe('authenticateUser()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var response, token, client = new UsergridClient()
    before(function(done) {
        client.authenticateUser({
            username: config.test.username,
            password: config.test.password
        }, function(err, r, t) {
            response = r
            token = t
            done()
        })
    })

    it('should fail when called without a email (or username) and password', function() {
        should(function() {
            var client = new UsergridClient()
            client.authenticateUser({})
        }).throw()
    })

    it('should return a 200 ok', function() {
        response.statusCode.should.equal(200)
    })

    it('should have a valid token', function() {
        token.should.be.a.String()
        token.length.should.be.greaterThan(10)
    })

    it('client.currentUser.auth.token should be set to the token returned from Usergrid', function() {
        client.currentUser.auth.should.have.property('token').equal(token)
    })

    it('client.currentUser.auth.isValid should be true', function() {
        client.currentUser.auth.should.have.property('isValid').which.is.true()
    })

    it('client.currentUser.auth.expiry should be set to a future date', function() {
        client.currentUser.auth.should.have.property('expiry').greaterThan(Date.now())
    })

    it('client.currentUser should have a username', function() {
        client.currentUser.should.have.property('username')
    })

    it('client.currentUser should have an email', function() {
        client.currentUser.should.have.property('email')
    })

    it('client.currentUser and client.currentUser.auth should not store password', function() {
        client.currentUser.should.not.have.property('password')
        client.currentUser.auth.should.not.have.property('password')
    })
})

describe('appAuth, setAppAuth()', function() {
    it('should initialize by passing a list of arguments', function() {
        var client = new UsergridClient()
        client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl)
        client.appAuth.should.be.instanceof(UsergridAppAuth)
    })

    it('should be a subclass of UsergridAuth', function() {
        var client = new UsergridClient()
        client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl)
        client.appAuth.should.be.instanceof(UsergridAuth)
    })

    it('should initialize by passing an object', function() {
        var client = new UsergridClient()
        client.setAppAuth({
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            tokenTtl: config.tokenTtl
        })
        client.appAuth.should.be.instanceof(UsergridAppAuth)
    })

    it('should initialize by passing an instance of UsergridAppAuth', function() {
        var client = new UsergridClient()
        client.setAppAuth(new UsergridAppAuth(config.clientId, config.clientSecret, config.tokenTtl))
        client.appAuth.should.be.instanceof(UsergridAppAuth)
    })

    it('should initialize by setting to an instance of UsergridAppAuth', function() {
        var client = new UsergridClient()
        client.appAuth = new UsergridAppAuth(config.clientId, config.clientSecret, config.tokenTtl)
        client.appAuth.should.be.instanceof(UsergridAppAuth)
    })
})