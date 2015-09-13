'use strict'

var Usergrid = require('./usergrid');

Usergrid.GET("https://api.usergrid.com/brandon.apigee/sandbox/tests", {
    headers: {
        'User-Agent': 'request'
    }
}, function(err, usergridResponse) {
    console.log(usergridResponse.entities.length);
    console.log(usergridResponse.first.uuid);
    console.log(usergridResponse.last.uuid);
});

Usergrid.GET("https://api.usergrid.com/the100/slack/games", function(err, usergridResponse) {
    console.log(usergridResponse.error);
});