/*
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var express = require('express'),
    app = express(),
    Usergrid = require('usergrid')

Usergrid.init()

// Usergrid.setAppAuth(id, secret)
// console.log(Usergrid.appAuth)
Usergrid.authenticateApp(function(err, usergridResponse) {
    if (usergridResponse.ok) {
        console.log('app is now authenticated')
    }
})

app.get('/:collection/:uuidOrName?', function(req, res) {
    Usergrid.GET(req.params.collection, req.params.uuidOrName, function(error, usergridResponse, entities) {
        res.json(entities);
    })
})

// app.listen(process.env.port || 9000)

/*

1. Start the server using > node app.js
2. Call the api at http://localhost:9000/cats/test

*/