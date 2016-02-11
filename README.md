[![Codacy Badge](https://api.codacy.com/project/badge/grade/034bc34302b646bf932c7c0307e0e313)](https://www.codacy.com/app/remus/usergrid-nodejs)
[![Travis CI Badge](https://travis-ci.org/r3mus/usergrid-nodejs.svg?branch=master)](https://travis-ci.org/r3mus/usergrid-nodejs)

# usergrid-nodejs
Node.js SDK 2.0 for Usergrid 

Version 2.0 of this SDK is currently a work in progress; documentation and implementation are subject to change.

**Note:** This Node.js SDK 2.0 for Usergrid is **not** backwards compatible with 0.1X versions of the SDK. If your application is dependent on the 0.1X set of Node.js APIs, you will need to continue using the 0.1X version (see below for installation instructions)._

## Current Release

- Pre-release: [Release Candidate 1](https://github.com/r3mus/usergrid-nodejs/releases), available here or on npm
- Stable: [0.10.11](https://github.com/apache/usergrid/tree/master/sdks/nodejs)
 
## 2.X Bugs

Please open an [issue](https://github.com/r3mus/usergrid-nodejs/issues/new)

## Known Issues

- Native support for push notifications is slated for RC2. Workaround is to send a regular POST request to `'devices/<device_ID>/notifications'`
- There is no clean way to require submodules (e.g. `UsergridClient` or `UsergridEntity`) modules without referencing the full path to `../lib/client`.
- Any other functionality that is missing or expected, please open an issue.

## Installation

To install the latest **stable** 0.1X build:

    npm install usergrid

(Or add `"usergrid": "~0.10.11"` to your package.json)

To install the 2.0 release candidates, install from [npm](https://www.npmjs.com/package/usergrid), specifying the version `~2.0.0-rc`:

    npm install usergrid@~2.0.0-rc

(Or add `"usergrid": "~2.0.0-rc"` to your package.json)

If you want access to the latest development build (you will need to run `npm install` to keep it up to date):

    npm install r3mus/usergrid-nodejs

## Usage

_Note: This section is a work in progress. In its current release candidate state, this SDK is only recommended for developers familiar with Usergrid, Node.js, and preferably Mocha tests, and is not recommended for production applications. For more advance and comprehensive usage, see `/tests`._

### Initialization

There are two fundamental ways to implement the Usergrid Node.js SDK: 

1. The singleton pattern is both convenient and enables the developer to use a globally available and always-initialized instance of Usergrid. 

	    var Usergrid = require('usergrid')
	    Usergrid.init({
	        orgId: '<org-id>',
	        appId: '<app-id>'
	    })
	    
	    // or you can load from a config file; see config.sample.json
	    
	    var Usergrid = require('usergrid')
	    Usergrid.init() // defaults to use config.json
    
2. The Instance pattern enables the develper to manage instances of the Usergrid client independently and in an isolated fashion. The primary use-case for this is when an application connects to multiple Usergrid targets:

	    var UsergridClient = require('./node_modules/usergrid/lib/client')
	    var client = new UsergridClient(config)

_Note: The following examples assume you are using the `Usergrid` shared instance. If you've implemented the instance pattern instead, simply replace `Usergrid` with your client instance variable. See `/tests` for advanced usage._

## RESTful operations

The Usergrid Node.js SDK is built on top of [request](https://github.com/request/request). As such behaves almost as a drop-in replacement. Where you would expect a standard error-first callback from request, the same is true of the Usergrid SDK methods.

When making any RESTful call, a `type` parameter (or `path`) is always required. Whether you specify this as an argument or in an object as a parameter is up to you.

### GET()

**GET entities in a collection**

    Usergrid.GET('collection', function(error, usergridResponse, entities) {
        // entities is an array of UsergridEntity objects
    })
    
**GET a specific entity in a collection by uuid or name**

    Usergrid.GET('collection', '<uuid-or-name>', function(error, usergridResponse, entity) {
        // entity, if found, is a UsergridEntity object
    })
    
**GET specific entities in a collection by passing a UsergridQuery object**

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
    
### POST() and PUT()

POST and PUT requests both require a JSON body payload. You can pass either a standard JavaScript object or a `UsergridEntity` instance. While the former works in principle, best practise is to use a `UsergridEntity` wherever practical. When an entity has a uuid or name property and already exists on the server, use a PUT request to update it. If it does not, use POST to create it.

**POST (create) a new entity in a collection**

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
    
**PUT (update) an entity in a collection**

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
        /*
    })
    
### DELETE()

DELETE requests require either a specific entity or a `UsergridQuery` object to be passed as an argument.
    
**DELETE a specific entity in a collection by uuid or name**

    Usergrid.DELETE('collection', '<uuid-or-name>', function(error, usergridResponse) {
        // if successful, entity will now be deleted
    })
    
**DELETE specific entities in a collection by passing a UsergridQuery object**

    var query = new UsergridQuery('cats')
                                 .eq('color', 'black')
                                 .or
                                 .eq('color', 'white')
                                 
    // this will build out the following query:
    // select * where color = 'black' or color = 'white'
    
    Usergrid.DELETE(query, function(error, usergridResponse) {
        // the first 10 entities matching this query criteria will be deleted
    })

## Entity operations and convenience methods

`UsergridEntity` has a number of helper/convenience methods to make working with entities more convenient. If you are _not_ utilizing the `Usergrid` shared instance, you must pass an instance of `UsergridClient` as the first argument to any of these helper methods.

### reload()

    entity.reload(function(error, usergridResponse) {
        // entity is now reloaded from the server
    })
    
### save()

    entity.aNewProperty = 'A new value'
    entity.save(function(error, usergridResponse) {
        // entity is now updated on the server
    })
    
### remove()

    entity.remove(function(error, usergridResponse) {
        // entity is now deleted on the server and the local instance should be destroyed
    })
    
## Authentication, current user, and auth-fallback

### appAuth and authenticateApp()

`Usergrid` can use the app client ID and secret that were passed upon initialization and automatically retrieve an app-level token for these credentials.

    Usergrid.setAppAuth('<client-id>', '<client-secret>')
    Usergrid.authenticateApp(function(error, usergridResponse, token) {
        // Usergrid.appAuth is created automatically when this call is successful
    })
    
### authFallback

Auth-fallback defines what the client should do when a user token is not present. By default, `Usergrid.authFallback` is set to `UsergridAuth.AUTH_FALLBACK_NONE`, whereby when a token is *not* present, an API call will be performed unauthenticated. If instead `Usergrid.authFallback` is set to `UsergridAuth.AUTH_FALLBACK_APP`, the API call will instead be performed using client credentials, _if_ they're available (i.e. `authenticateApp()` was performed at some point). 

### usingAuth()

At times it is desireable to have complete, granular control over the authentication context of an API call. To facilitate this, the passthrough function `.usingAuth()` allows you to pre-define the auth context of the next API call.

    // assume Usergrid.authFallback = UsergridAuth.AUTH_FALLBACK_NONE
    
    Usergrid.usingAuth(Usergrid.appAuth).POST('roles/guest/permissions', {
        permission: "get,post,put,delete:/**"
    }, function(error, usergridResponse) {
        // here we've temporarily used the client credentials to modify permissions
        // subsequent calls will not use this auth context
    })

### currentUser and authenticateUser()

`Usergrid` has a special `currentUser` property. By default, when calling `authenticateUser()`, `.currentUser` will be set to this user if the authentication flow is successful.

    Usergrid.authenticateUser({
        username: '<username>',
        email: '<email-address>', // either username or email is required
        password: '<password>'
    }, function(error, usergridResponse, token) {
        // Usergrid.currentUser is set to the authenticated user and the token is stored within that context
    })
    
If you want to utilize authenticateUser without setting as the current user, simply pass a `false` boolean value as the second parameter:

    Usergrid.authenticateUser({
        username: '<username>',
        email: '<email-address>', // either username or email is required
        password: '<password>'
    }, false, function(error, usergridResponse, token) {
    
    })
    
## User operations and convenience methods

`UsergridUser` has a number of helper/convenience methods to make working with user entities more convenient. If you are _not_ utilizing the `Usergrid` shared instance, you must pass an instance of `UsergridClient` as the first argument to any of these helper methods.
    
### create()

Creating a new user:

    var user = new UsergridUser({
        username: 'username',
        password: 'password'
    })
    
    user.create(function(error, usergridResponse, user) {
        // user has now been created and should have a valid uuid
    })
    
### login()

A simpler means of retrieving a user-level token:

    var user = new UsergridUser({
        username: 'username',
        password: 'password'
    })
    
    user.login(function(error, usergridResponse, token) {
        // user is now logged in
    })

### logout()

Logs out the selected user. You can also use this convenience method on `Usergrid.currentUser`.

    user.logout(function(error, usergridResponse) {
        // user is now logged out
    })
    
### logoutAllSessions()

Logs out all sessions for the selected user and destroys all active tokens. You can also use this convenience method on `Usergrid.currentUser`.

    user.logoutAllSessions(function(error, usergridResponse) {
        // user is now logged out from everywhere
    })
    
### resetPassword()

Resets the password for the selected user.

    user.resetPassword({
        oldPassword: '2cool4u',
        newPassword: 'correct-horse-battery-staple',
    }, function(error, response, success) {
        // if it was done correctly, the new password will be changed
        // 'success' is a boolean value that indicates whether it was changed successfully
    })
    
### UsergridUser.CheckAvailable()

This is a class (static) method that allows you to check whether a username or email address is available or not.

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

## UsergridResponse object

`UsergridResponse` implements several Usergrid-specific enhancements to [request](https://github.com/request/request). Notably:

### ok

You can check `usergridResponse.ok`, a `bool` value, to see if the response was successful. Any status code < 400 returns true.

    Usergrid.GET('collection', function(error, usergridResponse, entities) {
        if (usergridResponse.ok) {
            // woo!
        }
    })
    
### entity, entities, user, users, first, last

Depending on the call you make, you will receive either an array of UsergridEntity objects, or a single entity as the third parameter in the callback. If you're querying the `users` collection, these will also be `UsergridUser` objects, a subclass of `UsergridEntity`.

- `.first` returns the first entity in an array of entities; `.entity` is an alias to `.first`. If there are no entities, both of these will be undefined.
- `.last` returns the last entity in an array of entities; if there is only one entity in the array, this will be the same as `.first` _and_ `.entity`, and will be undefined if there are no entities in the response.
- `.entities` will either be an array of entities in the response, or an empty array.
- `.user` is a special alias for `.entity` for when querying the `users` collection. Instead of being a `UsergridEntity`, it will be its subclass, `UsergridUser`.
- `.users` is the same as `.user`, though behaves as `.entities` does by returning either an array of UsergridUser objects or an empty array.

Examples:

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
    
## Connections

Connections can be managed using `Usergrid.connect()`, `Usergrid.disconnect()`, and `Usergrid.getConnections()`, or entity convenience methods of the same name.

### connect

**Create a connection between two entities**

    Usergrid.connect(entity1, 'relationship', entity2, function(error, usergridResponse) {
        // entity1 now has an outbound connection to entity2
    })
    
### getConnections

**Retrieve outbound connections**

    client.getConnections(UsergridClient.Connections.DIRECTION_OUT, entity1, 'relationship', function(error, usergridResponse, entities) {
        // entities is an array of entities that entity1 is connected to via 'relationship'
        // in this case, we'll see entity2 in the array
    })
    
**Retrieve inbound connections**

    client.getConnections(UsergridClient.Connections.DIRECTION_IN, entity2, 'relationship', function(error, usergridResponse, entities) {
        // entities is an array of entities that connect to entity2 via 'relationship'
        // in this case, we'll see entity1 in the array
    })
    
### disconnect

**Delete a connection between two entities**

    Usergrid.disconnect(entity1, 'relationship', entity2, function(error, usergridResponse) {
        // entity1's outbound connection to entity2 has been destroyed
    })
    
## Assets

Assets can be uploaded and downloaded either directly using `Usergrid.POST` or `Usergrid.PUT`, or via `UsergridEntity` convenience methods. Before uploading an asset, you will need to initialize a `UsergridAsset` instance.

### UsergridAsset init

**Loading a file system image via `fs.readFile()`**

    var asset = new UsergridAsset('myImage')
    fs.readFile(_dirname + '/image.jpg', function(error, data) {
        asset.data = data
    })
    
**Loading a file system image from a read stream (`fs.createReadStream()`)**

    var asset = new UsergridAsset('myImage')
    fs.createReadStream(_dirname + '/image.jpg').pipe(asset).on('finish', function() {
        // now contains Buffer stream at asset.data
    })
    
You can also access `asset.contentType` and `asset.contentLength` once data has been loaded into a `UsergridAsset`.

### .POST and .PUT

**POST binary data to a collection by creating a new entity**

    var asset = new UsergridAsset('myImage')
    fs.createReadStream(_dirname + '/image.jpg').pipe(asset).on('finish', function() {
        client.POST('collection', asset, function(error, assetResponse, entityWithAsset) {
            // asset is now uploaded to Usergrid
        })
    })

**PUT binary data to an existing entity via attachAsset()**
    
    var asset = new UsergridAsset('myImage')
    fs.createReadStream(_dirname + '/image.jpg').pipe(asset).on('finish', function() {
        // assume entity already exists; attach it to the entity:
        entity.attachAsset(asset)
        client.PUT(entity, asset, function(error, assetResponse, entityWithAsset) {
            // asset is now uploaded to Usergrid
        })
    })
    
### UsergridEntity convenience methods

**entity.uploadAsset() is a much simpler means of uploading an asset**

    var asset = new UsergridAsset('myImage')
    fs.createReadStream(_dirname + '/image.jpg').pipe(asset).on('finish', function() {
        // assume entity already exists; attach it to the entity:
        entity.attachAsset(asset)
        entity.uploadAsset(function(error, assetResponse, entityWithAsset) {
            // asset is now uploaded to Usergrid
        })
    })
    
**entity.downloadAsset() allows you to download a binary asset**

    entity.uploadAsset(function(error, assetResponse, entityWithAsset) {
        // access the asset via entityWithAsset.asset
    })
