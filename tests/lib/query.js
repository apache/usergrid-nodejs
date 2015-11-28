'use strict'

var should = require('should'),
    UsergridQuery = require('../../lib/query'),
    util = require('util')

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

describe('builder pattern', function() {
    var queryString = "select * where weight > 2.4 and color contains 'bl*' and not color = 'blue' or color = 'orange'"
    it(util.format('query._ql should equal %s', queryString), function() {
        var query = new UsergridQuery('cats')
            .gt('weight', 2.4)
            .contains('color', 'bl*')
            .not
            .eq('color', 'blue')
            .or
            .eq('color', 'orange')
        query.should.have.property('_ql').equal(queryString)
    })
})