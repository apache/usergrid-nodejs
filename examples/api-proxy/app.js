var express = require('express'),
    app = express(),
    Usergrid = require('usergrid'),
    async = require('async'),
    chance = require('chance')

Usergrid.init()

app.get('/:collection/:uuidOrName?', function(req, res) {
    Usergrid.GET(req.params.collection, req.params.uuidOrName, function(error, usergridResponse, entities) {
        res.json(entities);
    })
})

app.listen(process.env.port || 9000)

/*

1. Start the server using > node app.js
2. Call the api at http://localhost:9000/cats/test

*/