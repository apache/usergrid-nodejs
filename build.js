'use strict'

var Usergrid = require('./usergrid');

Usergrid.GET("https://api.usergrid.com/brandon.apigee/sandbox/tests", {
    headers: {
        'User-Agent': 'request'
    }
}, function(err, usergridResponse) {
    console.log(usergridResponse.first);
});