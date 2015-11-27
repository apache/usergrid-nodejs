'use strict'

var should = require('should'),
    config = require('../../config.json'),
    UsergridClient = require('../../lib/client'),
    UsergridQuery = require('../../lib/query')

describe('type', function() {
    it('query._type should equal "cats" when passing "type" as a parameter to UsergridQuery', function() {
        var query = new UsergridQuery('cats')
        query.should.have.property('_type').equal('cats')
    })

    it('query._type should equal "cats" when calling .type() builder method', function() {
        var query = new UsergridQuery().type('cats')
        query.should.have.property('_type').equal('cats')
    })

    it('query._type should equal "cats" when calling .collection() builder method', function() {
        var query = new UsergridQuery().collection('cats')
        query.should.have.property('_type').equal('cats')
    })
})

describe('limit', function() {
    it('query._limit should equal 10', function() {
        var query = new UsergridQuery('cats').limit(10)
        query.should.have.property('_limit').equal(10)
    })
})

describe('eq', function() {
    var queryString = "select * where color = 'black'"
    it(util.format('query._ql should equal %s', queryString), function() {
        var query = new UsergridQuery().collection('cats').eq('color', 'black')
        query.should.have.property('_ql').equal(queryString)
    })
})

// console.log(.desc('color').ql)
// console.log(new UsergridQuery().collection('cats').gt('weight', 2.4).desc('color').ql)
// console.log(new UsergridQuery().collection('cats').limit(10).limit)