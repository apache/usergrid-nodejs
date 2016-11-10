[![Codacy Badge](https://api.codacy.com/project/badge/grade/034bc34302b646bf932c7c0307e0e313)](https://www.codacy.com/app/brandonscript/usergrid-nodejs)
[![Travis CI Badge](https://travis-ci.org/brandonscript/usergrid-nodejs.svg?branch=master)](https://travis-ci.org/brandonscript/usergrid-nodejs)
[![npm version](https://badge.fury.io/js/usergrid.svg)](https://badge.fury.io/js/usergrid)

# usergrid-nodejs
Node.js SDK 2.0 for Usergrid 

Version 2.0 of this SDK is currently a work in progress; documentation and implementation are subject to change.

_**Note:** This Node.js SDK 2.0 for Usergrid is **not** backwards compatible with 0.1X versions of the SDK. If your application is dependent on the 0.1X set of Node.js APIs, you will need to continue using the 0.1X version (see below for installation instructions)._

## Current Release

- Pre-release: [2.0 Release Candidate 2](https://github.com/brandonscript/usergrid-nodejs/releases), available here or on npm
- Stable: [0.10.11](https://github.com/apache/usergrid/tree/master/sdks/nodejs)
 
## 2.X Bugs

Please open an [issue](https://github.com/brandonscript/usergrid-nodejs/issues/new)

## Known Issues

- Native support for push notifications is slated for RC3. Workaround is to send a regular POST request to `'devices/<device_ID>/notifications'`
- There is no clean way to require submodules (e.g. `UsergridClient` or `UsergridEntity`) modules without referencing the full path to `../lib/<class>`.
- Any other functionality that is missing or expected, please open an issue.

## Installation

To install the latest **stable** 0.1X build:

    npm install usergrid

(Or add `"usergrid": "~0.10.11"` to your package.json)

To install the 2.0 release candidates, install from [npm](https://www.npmjs.com/package/usergrid), specifying the version `~2.0.0-rc`:

    npm install usergrid@~2.0.0-rc

(Or add `"usergrid": "~2.0.0-rc"` to your package.json)

If you want access to the latest development build (you will need to run `npm install` to keep it up to date):

    npm install brandonscript/usergrid-nodejs

## Usage

_**Note:** This section is a work in progress. In its current release candidate state, this SDK is only recommended for developers familiar with Usergrid, Node.js, and ideally Mocha tests. It is not recommended for production applications. For additional advanced/comprehensive usage, see `/tests`._

The Usergrid Node.js SDK is built on top of [request](https://github.com/request/request). As such, it behaves almost as a drop-in replacement. Where you would expect a standard error-first callback from request, the same is true of the Usergrid SDK methods. Where you would expect a response object as the second parameter in the callback, the same is true for the Usergrid SDK.


### Initialization

There are two different ways of initializing the Usergrid Node.js SDK: 

1. The singleton pattern is both convenient and enables the developer to use a globally available and always-initialized shared instance of Usergrid. 

	```js
	var Usergrid = require('usergrid')
	Usergrid.init({
	    orgId: '<org-id>',
	    appId: '<app-id>'
	})
	    
	// or you can load from a config file; see config.sample.json
	    
	var Usergrid = require('usergrid')
	Usergrid.init() // defaults to use config.json
	```
**Config File:**  Optionally, you can use a config file to provide the usergrid credentials for your app.  The usergrid module crawls your App file structure to find files named `usergrid.json` or a `config.json`.  If there are multiple files with one of these names present at different locations under the app, only one of them will be used and the others are ignored.  This may cause use of an unintended backend.  Please make sure you have only one of these files present in the root and subdirectories of your app.

2. The instance pattern enables the developer to manage instances of the Usergrid client independently and in an isolated fashion. The primary use-case for this is when an application connects to multiple Usergrid targets.

	```js
	var UsergridClient = require('./node_modules/usergrid/lib/client')
	var client = new UsergridClient(config)
	```

_**Note:** Examples in this readme assume you are using the `Usergrid` shared instance. If you've implemented the instance pattern instead, simply replace `Usergrid` with your client instance variable. See `/tests` for additional examples._

## RESTful operations

When making any RESTful call, a `type` parameter (or `path`) is always required. Whether you specify this as an argument, in an object as a parameter, or as part of a `UsergridQuery` object is up to you.

### GET()

To get entities in a collection:

```js
Usergrid.GET('collection', function(error, usergridResponse, entities) {
    // entities is an array of UsergridEntity objects
})
```
    
To get a specific entity in a collection by uuid or name:

```js
Usergrid.GET('collection', '<uuid-or-name>', function(error, usergridResponse, entity) {
    // entity, if found, is a UsergridEntity object
})
```
    
To get specific entities in a collection by passing a UsergridQuery object:

```js
var query = new UsergridQuery('cats')
                             .gt('weight', 2.4)
                             .contains('color', 'bl*')
                             .not
                             .eq('color', 'blue')
                             .or
                             .eq('color', 'orange')
                             
// this will build out the following query:
// select * where weight > 2.4 and color contains 'bl*' and not color = 'blue' or color = 'orange'
    
Usergrid.GET(query, function(error, usergridResponse) {
    // entities is an array of UsergridEntity objects matching the specified query
})
```
    
### POST() and PUT()

POST and PUT requests both require a JSON body payload. You can pass either a standard JavaScript object or a `UsergridEntity` instance. While the former works in principle, best practise is to use a `UsergridEntity` wherever practical. When an entity has a uuid or name property and already exists on the server, use a PUT request to update it. If it does not, use POST to create it.

To create a new entity in a collection (POST):

```js
var entity = new UsergridEntity({
    type: 'restaurant',
    restaurant: 'Dino's Deep Dish,
    cuisine: 'pizza'
})
    
// or
    
var entity = {
    type: 'restaurant',
    restaurant: 'Dino's Deep Dish,
    cuisine: 'pizza'
}
    
Usergrid.POST(entity, function(error, usergridResponse, entity) {
    // entity should now have a uuid property and be created
})
    
// you can also POST an array of entities:

var entities = [
    new UsergridEntity({
        type: 'restaurant',
        restaurant: 'Dino's Deep Dish,
        cuisine: 'pizza'
    }), 
    new UsergridEntity({
        type: 'restaurant',
        restaurant: 'Pizza da Napoli',
        cuisine: 'pizza'
    })
]
    
Usergrid.POST(entities, function(error, usergridResponse, entities) {
    //
})
```
    
To update an entity in a collection (PUT request):

```js
var entity = new UsergridEntity({
    type: 'restaurant',
    restaurant: 'Pizza da Napoli',
    cuisine: 'pizza'
})
    
Usergrid.POST(entity, function(error, usergridResponse, entity) {
    entity.owner = 'Mia Carrara'
    Usergrid.PUT(entity, function(error, usergridResponse, entity) {
        // entity now has the property 'owner'
    })
})
    
// or update a set of entities by passing a UsergridQuery object
    
var query = new UsergridQuery('restaurants')
                             .eq('cuisine', 'italian')
                             
// this will build out the following query:
// select * where cuisine = 'italian'
    
Usergrid.PUT(query, { keywords: ['pasta'] }, function(error, usergridResponse) {
    /* the first 10 entities matching this query criteria will be updated:
       e.g.:
       [
           {
               "type": "restaurant",
               "restaurant": "Il Tarazzo",
               "cuisine": "italian",
               "keywords": [
                   "pasta"
               ]
           },
           {
               "type": "restaurant",
               "restaurant": "Cono Sur Pizza & Pasta",
               "cuisine": "italian",
               "keywords": [
                   "pasta"
               ]
           }
        ]
    */
})
```
    
### DELETE()

DELETE requests require either a specific entity or a `UsergridQuery` object to be passed as an argument.
    
To delete a specific entity in a collection by uuid or name:

```js
Usergrid.DELETE('collection', '<uuid-or-name>', function(error, usergridResponse) {
    // if successful, entity will now be deleted
})
```
    
To specific entities in a collection by passing a `UsergridQuery` object:

```js
var query = new UsergridQuery('cats')
                             .eq('color', 'black')
                             .or
                             .eq('color', 'white')
                             
// this will build out the following query:
// select * where color = 'black' or color = 'white'
    
Usergrid.DELETE(query, function(error, usergridResponse) {
    // the first 10 entities matching this query criteria will be deleted
})
```

## Entity operations and convenience methods

`UsergridEntity` has a number of helper/convenience methods to make working with entities more convenient. If you are _not_ utilizing the `Usergrid` shared instance, you must pass an instance of `UsergridClient` as the first argument to any of these helper methods.

### reload()

Reloads the entity from the server

```js
entity.reload(function(error, usergridResponse) {
    // entity is now reloaded from the server
})
```
    
### save()

Saves (or creates) the entity on the server

```js
entity.aNewProperty = 'A new value'
entity.save(function(error, usergridResponse) {
    // entity is now updated on the server
})
```
    
### remove()

Deletes the entity from the server

```js
entity.remove(function(error, usergridResponse) {
    // entity is now deleted on the server and the local instance should be destroyed
})
```
    
## Authentication, current user, and authMode

### appAuth and authenticateApp()

`Usergrid` can use the app client ID and secret that were passed upon initialization and automatically retrieve an app-level token for these credentials.

```js
Usergrid.setAppAuth('<client-id>', '<client-secret>')
Usergrid.authenticateApp(function(error, usergridResponse, token) {
    // Usergrid.appAuth is created automatically when this call is successful
})
```

### currentUser and authenticateUser()

`Usergrid` has a special `currentUser` property. By default, when calling `authenticateUser()`, `.currentUser` will be set to this user if the authentication flow is successful.

```js
Usergrid.authenticateUser({
    username: '<username>',
    password: '<password>'
}, function(error, usergridResponse, token) {
    // Usergrid.currentUser is set to the authenticated user and the token is stored within that context
})
```
    
If you want to utilize authenticateUser without setting as the current user, simply pass a `false` boolean value as the second parameter:

```js
Usergrid.authenticateUser({
    username: '<username>',
    password: '<password>'
}, false, function(error, usergridResponse, token) {
    
})
```

### authMode

Auth-mode is used to determine what the `UsergridClient` will use for authorization.

By default, `Usergrid.authMode` is set to `UsergridAuth.AUTH_MODE_USER`, whereby if a non-expired `UsergridUserAuth` exists in `UsergridClient.currentUser`, this token is used to authenticate all API calls.

If instead `Usergrid.authMode` is set to `UsergridAuth.AUTH_MODE_NONE`, all API calls will be performed unauthenticated. 

If instead `Usergrid.authMode` is set to `UsergridAuth.AUTH_MODE_APP`, all API calls will be performed using the client credentials token, _if_ they're available (i.e. `authenticateApp()` was performed at some point). 

### usingAuth()

At times it is desireable to have complete, granular control over the authentication context of an API call. To facilitate this, the passthrough function `.usingAuth()` allows you to pre-define the auth context of the next API call.

```js
// assume Usergrid.authMode = UsergridAuth.AUTH_MODE_NONE
    
Usergrid.usingAuth(Usergrid.appAuth).POST('roles/guest/permissions', {
    permission: "get,post,put,delete:/**"
}, function(error, usergridResponse) {
    // here we've temporarily used the client credentials to modify permissions
    // subsequent calls will not use this auth context
})
```
    
## User operations and convenience methods

`UsergridUser` has a number of helper/convenience methods to make working with user entities more convenient. If you are _not_ utilizing the `Usergrid` shared instance, you must pass an instance of `UsergridClient` as the first argument to any of these helper methods.
    
### create()

Creating a new user:

```js
var user = new UsergridUser({
    username: 'username',
    password: 'password'
})
    
user.create(function(error, usergridResponse, user) {
    // user has now been created and should have a valid uuid
})
```
    
### login()

A simpler means of retrieving a user-level token:

```js
var user = new UsergridUser({
    username: 'username',
    password: 'password'
})
    
user.login(function(error, usergridResponse, token) {
    // user is now logged in
})
```

### logout()

Logs out the selected user. You can also use this convenience method on `Usergrid.currentUser`.

```js
user.logout(function(error, usergridResponse) {
    // user is now logged out
})
```
    
### logoutAllSessions()

Logs out all sessions for the selected user and destroys all active tokens. You can also use this convenience method on `Usergrid.currentUser`.

```js
user.logoutAllSessions(function(error, usergridResponse) {
    // user is now logged out from everywhere
})
```
    
### resetPassword()

Resets the password for the selected user.

```js
user.resetPassword({
    oldPassword: '2cool4u',
    newPassword: 'correct-horse-battery-staple',
}, function(error, response, success) {
    // if it was done correctly, the new password will be changed
    // 'success' is a boolean value that indicates whether it was changed successfully
})
```
    
### UsergridUser.CheckAvailable()

This is a class (static) method that allows you to check whether a username or email address is available or not.

```js
UsergridUser.CheckAvailable(client, {
    email: 'email'
}, function(err, response, exists) {
   // 'exists' is a boolean value that indicates whether a user already exists
})
    
UsergridUser.CheckAvailable(client, {
    username: 'username'
}, function(err, response, exists) {
   
})
    
UsergridUser.CheckAvailable(client, {
    email: 'email',
    username: 'username', // checks both email and username
}, function(err, response, exists) {
    // 'exists' returns true if either username or email exist
})
```
    
## Querying and filtering data

### UsergridQuery initialization

The `UsergridQuery` class allows you to build out complex query filters using the Usergrid [query syntax](http://docs.apigee.com/app-services/content/querying-your-data).

The first parameter of the `UsergridQuery` builder pattern should be the collection (or type) you intend to query. You can either pass this as an argument, or as the first builder object:

```js
var query = new UsergridQuery('cats')
// or
var query = new UsergridQuery().type('cats')
var query = new UsergridQuery().collection('cats')
```

You then can layer on additional queries:

```js
var query = new UsergridQuery('cats')
            .gt('weight', 2.4)
            .contains('color', 'bl*')
            .not
            .eq('color', 'white')
            .or
            .eq('color', 'orange') 
```
            
You can also adjust the number of results returned:

```js
var query = new UsergridQuery('cats').eq('color', 'black').limit(100)
// returns a maximum of 100 entiteis
```
    
And sort the results:

```js
var query = new UsergridQuery('cats').eq('color', 'black').asc('name')
// sorts by 'name', ascending
```
    
And you can do geo-location queries:

```js
var query = new UsergridQuery('devices').locationWithin(<distanceInMeters>, <latitude>, <longitude>)
```
    
### Using a query in a request

Queries can be passed as parameters to GET, PUT, and DELETE requests:

```js
Usergrid.GET(query, function(error, usergridResponse, entities) {
    //
})
    
Usergrid.PUT(query, { aNewProperty: "A new value" }, function(error, usergridResponse, entities) {
    //
})
    
Usergrid.DELETE(query, function(error, usergridResponse, entities) {
    //
})
```
    
While not a typical use case, sometimes it is useful to be able to create a query that works on multiple collections. Therefore, in each one of these RESTful calls, you can optionally pass a 'type' string as the first argument:

```js
Usergrid.GET('cats', query, function(error, usergridResponse, entities) {
    //
})
```
    
### List of query builder objects

`type('string')`

> The collection name to query

`collection('string')`

> An alias for `type`

`eq('key', 'value')` or `equal('key', 'value')`

> Equal to (e.g. `where color = 'black'`)

`contains('key', 'value')`

> Contains a string (e.g.` where color contains 'bl*'`)

`gt('key', 'value')` or `greaterThan('key', 'value')`

> Greater than (e.g. `where weight > 2.4`)

`gte('key', 'value')` or `greaterThanOrEqual('key', 'value')`

> Greater than or equal to (e.g. `where weight >= 2.4`)

`lt('key', 'value')` or `lessThan('key', 'value')`

> Less than (e.g. `where weight < 2.4`)

`lte('key', 'value')` or `lessThanOrEqual('key', 'value')`

> Less than or equal to (e.g. `where weight <= 2.4`)

`not`

> Negates the next block in the builder pattern, e.g.:

```js
var query = new UsergridQuery('cats').not.eq('color', 'black')
// select * from cats where not color = 'black'
```

`and`

> Joins two queries by requiring both of them. `and` is also implied when joining two queries _without_ an operator. E.g.:

```js
var query = new UsergridQuery('cats').eq('color', 'black').eq('fur', 'longHair')
// is identical to:
var query = new UsergridQuery('cats').eq('color', 'black').and.eq('fur', 'longHair')  
```

`or`

> Joins two queries by requiring only one of them. `or` is never implied. E.g.:

```js
var query = new UsergridQuery('cats').eq('color', 'black').or.eq('color', 'white')
```
    
> When using `or` and `and` operators, `and` joins will take precedence over `or` joins. You can read more about query operators and precedence [here](http://docs.apigee.com/api-baas/content/supported-query-operators-data-types).

`locationWithin(distanceInMeters, latitude, longitude)`

> Returns entities which have a location within the specified radius. Arguments can be `float` or `int`.

`asc('key')`

> Sorts the results by the specified property, ascending

`desc('key')`

> Sorts the results by the specified property, descending

`sort('key', 'order')`

> Sorts the results by the specified property, in the specified order (`asc` or `desc`).
 
`limit(int)`

> The maximum number of entities to return

`cursor('string')`

> A pagination cursor string

`fromString('query string')`

> A special builder property that allows you to input a pre-defined query string. All other builder properties will be ignored when this property is defined. For example:
    
```js
var query = new UsergridQuery().fromString("select * where color = 'black' order by name asc")
```

## UsergridResponse object

`UsergridResponse` implements several Usergrid-specific enhancements to [request](https://github.com/request/request). Notably:

### ok

You can check `usergridResponse.ok`, a `bool` value, to see if the response was successful. Any status code < 400 returns true.

```js
Usergrid.GET('collection', function(error, usergridResponse, entities) {
    if (usergridResponse.ok) {
        // woo!
    }
})
```
    
### entity, entities, user, users, first, last

Depending on the call you make, you will receive either an array of UsergridEntity objects, or a single entity as the third parameter in the callback. If you're querying the `users` collection, these will also be `UsergridUser` objects, a subclass of `UsergridEntity`.

- `.first` returns the first entity in an array of entities; `.entity` is an alias to `.first`. If there are no entities, both of these will be undefined.
- `.last` returns the last entity in an array of entities; if there is only one entity in the array, this will be the same as `.first` _and_ `.entity`, and will be undefined if there are no entities in the response.
- `.entities` will either be an array of entities in the response, or an empty array.
- `.user` is a special alias for `.entity` for when querying the `users` collection. Instead of being a `UsergridEntity`, it will be its subclass, `UsergridUser`.
- `.users` is the same as `.user`, though behaves as `.entities` does by returning either an array of UsergridUser objects or an empty array.

Examples:

```js
Usergrid.GET('collection', function(error, usergridResponse, entities) {
    // third param is an array of entities because no specific entity was referenced
    // you can also access:
    //     usergridResponse.entities
    //     usergridResponse.first    
    //     usergridResponse.entity (the first entity)      
    //     usergridResponse.last		 
})
    
Usergrid.GET('collection', '<uuid or name>', function(error, usergridResponse, entity) {
    // third param is a single entity object
    // you can also access:
    //     usergridResponse.entity
    //     usergridResponse.first  
    //     usergridResponse.last                
})
    
Usergrid.GET('users', function(error, usergridResponse, users) {
    // third param is an array of users because no specific user was referenced
    // you can also access:
    //     usergridResponse.users
    //     usergridResponse.user (the first user)          
    //     usergridResponse.last 
})
    
Usergrid.GET('users', '<uuid, username, or email>', function(error, usergridResponse, user) {
    // third param is a single user object
    // you can also access:
    //     usergridResponse.user
})
```
    
## Connections

Connections can be managed using `Usergrid.connect()`, `Usergrid.disconnect()`, and `Usergrid.getConnections()`, or entity convenience methods of the same name.

### connect

Create a connection between two entities:

```js
Usergrid.connect(entity1, 'relationship', entity2, function(error, usergridResponse) {
    // entity1 now has an outbound connection to entity2
})
```
    
### getConnections

Retrieve outbound connections:

```js
client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, 'relationship', function(error, usergridResponse, entities) {
    // entities is an array of entities that entity1 is connected to via 'relationship'
    // in this case, we'll see entity2 in the array
})
```
    
Retrieve inbound connections:

```js
client.getConnections(UsergridClient.Connections.DIRECTION_IN, entity2, 'relationship', function(error, usergridResponse, entities) {
    // entities is an array of entities that connect to entity2 via 'relationship'
    // in this case, we'll see entity1 in the array
})```
    
### disconnect

Delete a connection between two entities:

```js
Usergrid.disconnect(entity1, 'relationship', entity2, function(error, usergridResponse) {
    // entity1's outbound connection to entity2 has been destroyed
})
```
    
## Assets

Assets can be uploaded and downloaded either directly using `Usergrid.POST` or `Usergrid.PUT`, or via `UsergridEntity` convenience methods. Before uploading an asset, you will need to initialize a `UsergridAsset` instance.

### UsergridAsset init

Loading a file system image via `fs.readFile()`:

```js
var asset = new UsergridAsset('myImage')
fs.readFile(_dirname + '/image.jpg', function(error, data) {
    asset.data = data
})
```
    
Loading a file system image from a read stream (`fs.createReadStream()`):

```js
var asset = new UsergridAsset('myImage')
fs.createReadStream(_dirname + '/image.jpg').pipe(asset).on('finish', function() {
    // now contains Buffer stream at asset.data
})
```
    
You can also access `asset.contentType` and `asset.contentLength` once data has been loaded into a `UsergridAsset`.

### .POST and .PUT

POST binary data to a collection by creating a new entity:

```js
var asset = new UsergridAsset('myImage')
fs.createReadStream(_dirname + '/image.jpg').pipe(asset).on('finish', function() {
    client.POST('collection', asset, function(error, assetResponse, entityWithAsset) {
        // asset is now uploaded to Usergrid
    })
})
```

PUT binary data to an existing entity via attachAsset():
    
```js
var asset = new UsergridAsset('myImage')
fs.createReadStream(_dirname + '/image.jpg').pipe(asset).on('finish', function() {
    // assume entity already exists; attach it to the entity:
    entity.attachAsset(asset)
    client.PUT(entity, asset, function(error, assetResponse, entityWithAsset) {
        // asset is now uploaded to Usergrid
    })
})
```
    
### UsergridEntity convenience methods

`entity.uploadAsset()` is a convenient way to upload an asset that is attached to an entity:

```js
var asset = new UsergridAsset('myImage')
fs.createReadStream(_dirname + '/image.jpg').pipe(asset).on('finish', function() {
    // assume entity already exists; attach it to the entity:
    entity.attachAsset(asset)
    entity.uploadAsset(function(error, assetResponse, entityWithAsset) {
        // asset is now uploaded to Usergrid
    })
})
```
    
`entity.downloadAsset()` allows you to download a binary asset:

```js
entity.uploadAsset(function(error, assetResponse, entityWithAsset) {
    // access the asset via entityWithAsset.asset
})```
