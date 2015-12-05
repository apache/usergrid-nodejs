'use strict'

var should = require('should'),
    config = require('../../helpers').config,
    UsergridClient = require('../../lib/client'),
    UsergridResponseError = require('../../lib/responseError')

var client = new UsergridClient()

var _response

describe('name, description, exception', function() {

    before(function(done) {

        this.slow(1000)
        this.timeout(6000)

        client.GET(config.testCollection, 'BADNAMEORUUID', function(err, usergridResponse) {
            _response = usergridResponse
            done()
        })
    })

    it('response.statusCode should be greater than or equal to 400', function() {
        _response.statusCode.should.be.greaterThanOrEqual(400)
    })

    it('response.error should be a UsergridResponseError object with name, description, and exception keys', function() {
        _response.statusCode.should.not.equal(200)
        _response.error.should.be.an.instanceof(UsergridResponseError).with.keys(['name', 'description', 'exception'])
    })
})

describe('undefined check', function() {
    it('response.error should be undefined on a successful response', function(done) {
        this.slow(1000)
        this.timeout(6000)
        client.GET(config.testCollection, function(err, usergridResponse) {
            usergridResponse.statusCode.should.equal(200)
            should(usergridResponse.error).be.undefined()
            done()
        })
    })
})