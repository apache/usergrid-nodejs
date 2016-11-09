'use strict'

var should = require('should'),
    config = require('../../helpers').config,
    UsergridEntity = require('../../lib/entity'),
    UsergridAsset = require('../../lib/asset'),
    UsergridClient = require('../../lib/client'),
    util = require('util'),
    request = require('request'),
    fs = require('fs'),
    _ = require('lodash')

var _slow = 6000,
    _timeout = 12000,
    filename = 'old_man',
    file = __dirname + '/image.jpg',
    testFile = __dirname + '/image_test.jpg',
    expectedContentLength = 109055

describe('init from fs.readFile()', function() {
    var asset = new UsergridAsset(filename, file)

    before(function(done) {
        fs.readFile(file, function(err, data) {
            asset.data = data
            done()
        })
    })

    it('asset.data should be a binary Buffer', function() {
        asset.data.should.be.a.buffer
    })

    it('asset.contentType should be inferred from Buffer', function() {
        asset.contentType.should.equal('image/jpeg')
    })

    it(util.format('asset.contentLength should be %s bytes', expectedContentLength), function() {
        asset.contentLength.should.equal(expectedContentLength)
    })
})

describe('init from piped writable stream', function() {
    var asset = new UsergridAsset(filename, file)
    var writeTestAsset = new UsergridAsset('image_test', testFile)
    before(function(done) {
        var stream = fs.createReadStream(file).pipe(asset),
            writeTest
        stream.on('finish', function() {
            fs.writeFile(testFile, asset.data)
            writeTest = fs.createReadStream(file).pipe(writeTestAsset)
            writeTest.on('finish', function() {
                done()
            })
        })
    })

    it('asset.data should be a binary Buffer', function() {
        asset.data.should.be.a.buffer
    })

    it('asset.contentType should be inferred from Buffer', function() {
        asset.contentType.should.equal('image/jpeg')
    })

    it(util.format('asset.contentLength should be %s bytes', expectedContentLength), function() {
        asset.contentLength.should.equal(expectedContentLength)
    })

    it('should write an identical asset to the filesystem', function() {
        writeTestAsset.contentType.should.equal('image/jpeg')
        writeTestAsset.contentLength.should.equal(expectedContentLength)
    })
})

describe('upload via client.POST to a specific entity', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var client = new UsergridClient()
    it('should upload a binary asset and create a new entity', function(done) {
        var asset = new UsergridAsset(filename, file)
        fs.createReadStream(file).pipe(asset).on('finish', function() {
            client.POST(config.test.collection, asset, function(err, assetResponse, entityWithAsset) {
                assetResponse.statusCode.should.equal(200)
                entityWithAsset.should.have.property('file-metadata')
                entityWithAsset['file-metadata'].should.have.property('content-type').equal('image/jpeg')
                entityWithAsset['file-metadata'].should.have.property('content-length').equal(expectedContentLength)
                entityWithAsset.remove(client)
                done()
            })
        })
    })
})

describe('upload via client.PUT to a specific entity', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var client = new UsergridClient()
    it('should upload a binary asset to an existing entity', function(done) {
        var entity = new UsergridEntity({
            type: config.test.collection,
            name: "AssetTestPUT",
        })
        var asset = new UsergridAsset(filename, file)
        client.PUT(entity, function(err, entityResponse, createdEntity) {
            fs.createReadStream(file).pipe(asset).on('finish', function() {
                client.PUT(createdEntity, asset, function(err, assetResponse, entityWithAsset) {
                    assetResponse.statusCode.should.equal(200)
                    entityWithAsset.should.have.property('file-metadata')
                    entityWithAsset['file-metadata'].should.have.property('content-type').equal('image/jpeg')
                    entityWithAsset['file-metadata'].should.have.property('content-length').equal(expectedContentLength)
                    done()
                })
            })
        })
    })
})