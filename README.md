[![Codacy Badge](https://api.codacy.com/project/badge/grade/034bc34302b646bf932c7c0307e0e313)](https://www.codacy.com/app/remus/usergrid-nodejs)
[![Travis CI Badge](https://travis-ci.org/r3mus/usergrid-nodejs.svg?branch=master)](https://travis-ci.org/r3mus/usergrid-nodejs)

# usergrid-nodejs
Node.js SDK 2.0 for Usergrid 

Currently a work in progress; documentation and implementation are subject to change.

_**Note:** This Node.js SDK 2.0 for Usergrid is **not** backwards compatible with 0.1X versions of the SDK. If your application is dependent on the 0.1X set of Node.js APIs, you will need to continue using the 0.1X version (see below for installation instructions)._

### Current release

[Release Candidate 0](https://github.com/r3mus/usergrid-nodejs/releases), available here or on npm
 
### Bugs

Please open an [issue](https://github.com/r3mus/usergrid-nodejs/issues/new)

### Known Issues

- AuthFallback is incomplete; currently there is no ad-hoc implementation for authentication (e.g. you cannot pass a instance of UsergridAuth, nor can you force a call to be made unauthenticated if there is a stored token)
- Authentication header is missing from certain API calls that don't leverage the UsergridRequest class. Recommend refactoring UsergridRequest to support all types of API calls (including login, logout, reset password)
- Assets are not implemented yet
- Many missing tests around authentication and passing a UsergridClient as a separate instance
- Easy (clean) way to load the UsergridClient module without referencing the full path
- Any other functionality that is missing or expected, please open an issue

### Installation

To install the latest **stable** 0.1X build:

    npm install usergrid

(Or add `"usergrid": "~0.10.11"` to your package.json)

To install the 2.0 release candidates, install from [npm](https://www.npmjs.com/package/usergrid), specifying the version `~2.0.0-rc`:

    npm install usergrid@~2.0.0-rc

(Or add `"usergrid": "~2.0.0-rc"` to your package.json)

If you want access to the latest development build (you will need to run `npm install` to keep it up to date):

    npm install r3mus/usergrid-nodejs

### Usage

_Note: This section is left intentionally light. In its current release candidate state, this SDK is only recommended for developers familiar with Usergrid, Node.js, and preferably Mocha tests. For full usage and implementation, have a look in `/tests`._

There are two fundamental ways to use the new Node SDK:

1. Singleton pattern:

	    var Usergrid = require('usergrid')
	    Usergrid.init({
	        orgId: ...,
	        appId: ...
	    })
	    
	    // or from a config file, see config.sample.json
	    
	    var Usergrid = require('usergrid')
	    Usergrid.init() // defaults to use config.json
    
2. Instance pattern (primarily used when connecting to multiple Usergrid targets):

	    var UsergridClient = require('./node_modules/usergrid/lib/client')
	    var client = new UsergridClient(config)