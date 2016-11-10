'use strict'

var should = require('should'),
    config = require('../../helpers').config,
    chance = new require('chance').Chance(),
    UsergridClient = require('../../lib/client'),
    UsergridEntity = require('../../lib/entity'),
    UsergridQuery = require('../../lib/query'),
    _ = require('lodash')

var _uuid,
    _slow = 500,
    _timeout = 4000

describe('GET()', function() {
    this.slow(_slow)
    this.timeout(_timeout)

    var response, client
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

    it('response.ok should be true', function() {
        response.ok.should.be.true()
    })

    it('response.entities should be an array', function() {
        response.entities.should.be.an.Array()
    })

    it('response.first should exist and have a valid uuid', function() {
        response.first.should.be.an.instanceof(UsergridEntity).with.property('uuid').which.is.a.uuid()
    })

    it('response.entity should exist and have a valid uuid', function() {
        response.entity.should.be.an.instanceof(UsergridEntity).with.property('uuid').which.is.a.uuid()
    })

    it('response.last should exist and have a valid uuid', function() {
        response.last.should.be.an.instanceof(UsergridEntity).with.property('uuid').which.is.a.uuid()
    })

    it('each entity should match the search criteria when passing a UsergridQuery object', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        var query = new UsergridQuery(config.test.collection).eq('color', 'black')

        client.GET(query, function(err, usergridResponse) {
            usergridResponse.entities.forEach(function(entity) {
                entity.should.be.an.Object().with.property('color').equal('black')
            })
            done()
        })
    })

    it('a single entity should be retrieved when specifying a uuid', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        client.GET(config.test.collection, response.entity.uuid, function(err, usergridResponse) {
            usergridResponse.should.have.property('entity').which.is.an.instanceof(UsergridEntity)
            usergridResponse.body.entities.should.be.an.Array().with.a.lengthOf(1)
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

    it('response.ok should be true', function() {
        response.ok.should.be.true()
    })

    it('response.entities should be an array', function() {
        response.entities.should.be.an.Array().with.a.lengthOf(1)
    })

    it('response.entity should exist and have a valid uuid', function() {
        response.entity.should.be.an.instanceof(UsergridEntity).with.property('uuid').which.is.a.uuid()
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

    it('should support creating an entity by passing a UsergridEntity object with a unique name', function(done) {

        this.slow(_slow)
        this.timeout(_timeout)

        var entity = new UsergridEntity({
            type: config.test.collection,
            name: chance.word()
        })
        client.POST(entity, function(err, usergridResponse) {
            usergridResponse.entity.should.be.an.Object().with.property('name').equal(entity.name)
            usergridResponse.entity.remove(client)
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
            usergridResponse.entity.should.be.an.Object().with.property('restaurant').equal(usergridResponse.entity.restaurant)
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

    it('response.ok should be true', function() {
        response.ok.should.be.true()
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
            usergridResponse.entity.should.be.an.instanceof(UsergridEntity).with.property('uuid').which.is.a.uuid()
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
        this.timeout(_timeout + 10000)

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

    it('should return a 404 not found', function() {
        response.statusCode.should.equal(404)
    })

    it('response.error.name should equal "entity_not_found"', function() {
        response.error.name.should.equal((config.target === '1.0') ? 'service_resource_not_found' : 'entity_not_found')
    })

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
                    delResponse.ok.should.be.false()
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
        this.timeout(_timeout + 6000)

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