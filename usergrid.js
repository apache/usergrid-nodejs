'use strict'

var usergridRequest = require('./lib/request');



// var usergridRequest = usergridRequest;

usergridRequest.GET = usergridRequest.get

var Usergrid = usergridRequest;

Usergrid.GET("https://api.usergrid.com/brandon.apigee/sandbox/tests", {
    headers: {
        'User-Agent': 'request'
    }
}, function(err, usergridResponse) {
    console.log(usergridResponse.first);
});

// console.log(usergridRequest.super_);
// console.log(usergridRequest.pat());
// usergridRequest.get("https://api.usergrid.com/brandon.apigee/sandbox/tests", function(err, response, body) {
//     console.log(body);
// });