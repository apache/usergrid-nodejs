'use strict'

var should = require('should')
var ok = require('objectkit')

var config = require('./config')
var Usergrid = require('../usergrid')
var UsergridClient = require('../lib/client')

describe('Usergrid', function() {
    it('should fail to initialize without a client ID and secret', function() {
        should(function() {
            Usergrid.initialize()
        }).throw()
    })

    it('should initialize when using a client ID and secret', function(done) {
        Usergrid.initialize(config.clientId, config.clientSecret)
        Usergrid.should.be.ok
        done()
    })
});


// Usergrid.init('peter', 'frog')
// var client = new UsergridClient('bob', 'joe')

// Usergrid.GET("https://api.usergrid.com/brandon.apigee/sandbox/tests", {
//     headers: {
//         'User-Agent': 'request'
//     }
// }, function(err, usergridResponse) {
//     console.log('test1', usergridResponse.entities.length);
//     console.log('test2', usergridResponse.first.uuid);
//     console.log('test3', usergridResponse.last.uuid);
// })

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