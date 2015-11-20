'use strict'

var should = require('should')
var ok = require('objectkit')

var config = require('../package.json')
var Usergrid = require('../usergrid')
var UsergridClient = require('../lib/client')

describe('Usergrid', function() {
    it('should fail to initialize without an orgId and appId', function() {
        should(function() {
            Usergrid.initialize()
        }).throw()
    })

    it('should initialize when using an orgId and appId', function(done) {
        Usergrid.initialize(config.usergrid.orgId, config.usergrid.appId)
        Usergrid.orgId.should.equal(config.usergrid.orgId)
        Usergrid.appId.should.equal(config.usergrid.appId)
        Usergrid.should.be.ok
        done()
    })
});

describe('Usergrid.GET', function() {
    
    this.slow(1000)
    this.timeout(6000)

    it('should make a GET call to usergrid and retrieve entities', function(done) {
        Usergrid.GET('tests', {
            headers: {
                'User-Agent': 'request'
            }
        }, function(err, usergridResponse) {
            usergridResponse.statusCode.should.equal(200)
            usergridResponse.entities.should.be.an.instanceOf(Array)
            usergridResponse.first.should.be.an.instanceOf(Object)
            usergridResponse.last.should.be.an.instanceOf(Object)
            usergridResponse.first.uuid.should.be.an.instanceOf(String)
            usergridResponse.last.uuid.should.be.an.instanceOf(String)
            done()
        })
    })
})

// Usergrid.init('peter', 'frog')
// var client = new UsergridClient('bob', 'joe')



// Usergrid.POST("https://api.usergrid.com/brandon.apigee/sandbox/tests", {
//     headers: {
//         'User-Agent': 'request'
//     },
//     body: {
//         "this": "that"
//     }
// }, function(err, usergridResponse) {
//     console.log('test4', usergridResponse.entities[0].this);
// })

// Usergrid.GET("https://api.usergrid.com/brandon.apigee/sandbox/tests", {
//     headers: {
//         'User-Agent': 'request'
//     },
//     qs: {
//         ql: "where this = 'that'"
//     }
// }, function(err, usergridResponse) {
//     console.log('test5', usergridResponse.entities[0].this);
// })

// // client.GET("https://api.usergrid.com/brandon.apigee/sandbox/tests", {
// //     headers: {
// //         'User-Agent': 'request'
// //     }
// // }, function(err, usergridResponse) {
// //     console.log('test1', usergridResponse.entities.length);
// //     console.log('test2', usergridResponse.first.uuid);
// //     console.log('test3', usergridResponse.last.uuid);
// // })


// // Usergrid.initialize('bob', 'joe')

// // Usergrid.GET("https://api.usergrid.com/brandon.apigee/sandbox/tests", {
// //     headers: {
// //         'User-Agent': 'request'
// //     }
// // }, function(err, usergridResponse) {
// //     console.log('test1', usergridResponse.entities.length);
// //     console.log('test2', usergridResponse.first.uuid);
// //     console.log('test3', usergridResponse.last.uuid);
// // })

// // Usergrid.GET({
// //     url: "https://api.usergrid.com/brandon.apigee/sandbox/tests",
// // }, function(err, usergridResponse) {
// //     console.log('test2', usergridResponse.first.uuid);
// // })

// // Usergrid.GET("https://api.usergrid.com/the100/slack/games", function(err, usergridResponse) {
// //     console.log('test3', usergridResponse.error);
// // })