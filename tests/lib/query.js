'use strict'

var should = require('should'),
    UsergridQuery = require('../../lib/query'),
    util = require('util')

describe('_type', function() {
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

describe('_limit', function() {
    it('query._limit should equal 10', function() {
        var query = new UsergridQuery('cats').limit(10)
        query.should.have.property('_limit').equal(10)
    })
})

describe('_ql', function() {
    var q1 = "select * where weight > 2.4 and color contains 'bl*' and not color = 'blue' or color = 'orange'"
    it('should support complex builder syntax (chained constructor methods)', function() {
        var query = new UsergridQuery('cats')
            .gt('weight', 2.4)
            .contains('color', 'bl*')
            .not
            .eq('color', 'blue')
            .or
            .eq('color', 'orange')
        query.should.have.property('_ql').equal(q1)
    })

    var q2 = "select * where color = 'black'"
    it('string values should be contained in single quotes', function() {
        var query = new UsergridQuery('cats')
            .eq('color', 'black')
        query.should.have.property('_ql').equal(q2)
    })

    var q3 = "select * where longHair = true"
    it('boolean values should not be contained in single quotes', function() {
        var query = new UsergridQuery('cats')
            .eq('longHair', true)
        query.should.have.property('_ql').equal(q3)
    })

    var q4 = "select * where weight < 18"
    it('float values should not be contained in single quotes', function() {
        var query = new UsergridQuery('cats')
            .lt('weight', 18)
        query.should.have.property('_ql').equal(q4)
    })

    var q5 = "select * where weight >= 2"
    it('integer values should not be contained in single quotes', function() {
        var query = new UsergridQuery('cats')
            .gte('weight', 2)
        query.should.have.property('_ql').equal(q5)
    })

    var q6 = "select * where uuid = a61e29ba-944f-11e5-8690-fbb14f62c803"
    it('uuid values should not be contained in single quotes', function() {
        var query = new UsergridQuery('cats')
            .eq('uuid', 'a61e29ba-944f-11e5-8690-fbb14f62c803')
        query.should.have.property('_ql').equal(q6)
    })
})