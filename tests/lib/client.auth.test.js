'use strict'

var should = require('should'),
    chance = new require('chance').Chance(),
    util = require('util'),
    config = require('../../helpers').config,
    UsergridClient = require('../../lib/client'),
    UsergridAuth = require('../../lib/auth'),
    UsergridAppAuth = require('../../lib/appAuth'),
    UsergridUserAuth = require('../../lib/userAuth'),
    UsergridUser = require('../../lib/user'),
    _ = require('lodash')

var _uuid,
    _slow = 500,
    _timeout = 4000

describe('authMode', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var response, token, client = new UsergridClient()
    before(function(done) {
        // authenticate app and remove sandbox permissions
        client.setAppAuth(config.clientId, config.clientSecret)
        client.authenticateApp(function(e, r, t) {
            response = r
            token = t
            client.usingAuth(client.appAuth).DELETE('roles/guest/permissions', {
                permission: "get,post,put,delete:/**"
            }, function() {
                done()
            })
        })
    })

    it('should fall back to using no authentication when currentUser is not authenticated and authMode is set to NONE', function(done) {
        client.authMode = UsergridAuth.AUTH_MODE_NONE
        client.GET('users', function(error, usergridResponse) {
            should(client.currentUser).be.undefined()
            usergridResponse.request.headers.should.not.have.property('authorization')
            error.name.should.equal('unauthorized')
            usergridResponse.ok.should.be.false()
            done()
        })
    })

    it('should fall back to using the app token when currentUser is not authenticated and authMode is set to APP', function(done) {
        client.authMode = UsergridAuth.AUTH_MODE_APP
        client.GET('users', function(error, usergridResponse, user) {
            should(client.currentUser).be.undefined()
            usergridResponse.request.headers.should.have.property('authorization').equal(util.format('Bearer %s', token))
            usergridResponse.ok.should.be.true()
            user.should.be.an.instanceof(UsergridUser)
            done()
        })
    })

    after(function(done) {
        // re-add sandbox permissions
        client.authMode = UsergridAuth.AUTH_MODE_NONE
        client.usingAuth(client.appAuth).POST('roles/guest/permissions', {
            permission: "get,post,put,delete:/**"
        }, function(error, usergridResponse) {
            done()
        })
    })
})

describe('authenticateApp()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var response, token, client = new UsergridClient()
    before(function(done) {
        client.setAppAuth(config.clientId, config.clientSecret)
        client.authenticateApp(function(err, r, t) {
            response = r
            token = t
            done()
        })
    })

    it('response.ok should be true', function() {
        response.ok.should.be.true()
    })

    it('should have a valid token', function() {
        token.should.be.a.String()
        token.length.should.be.greaterThan(10)
    })

    it('client.appAuth.token should be set to the token returned from Usergrid', function() {
        client.appAuth.should.have.property('token').equal(token)
    })

    it('client.appAuth.isValid should be true', function() {
        client.appAuth.should.have.property('isValid').which.is.true()
    })

    it('client.appAuth.expiry should be set to a future date', function() {
        client.appAuth.should.have.property('expiry').greaterThan(Date.now())
    })

    it('should fail when called without a clientId and clientSecret', function() {
        should(function() {
            var client = new UsergridClient()
            client.setAppAuth(undefined, undefined, 0)
            client.authenticateApp()
        }).throw()
    })

    it('should authenticate by passing clientId and clientSecret in an object', function(done) {
        var isolatedClient = new UsergridClient()
        isolatedClient.authenticateApp(config, function(err, reponse, token) {
            isolatedClient.appAuth.should.have.property('token').equal(token)
            done()
        })
    })

    it('should authenticate by passing a UsergridAppAuth instance with a custom ttl', function(done) {
        var isolatedClient = new UsergridClient()
        var ttlInMilliseconds = 500000
        var appAuth = new UsergridAppAuth(config.clientId, config.clientSecret, ttlInMilliseconds)
        isolatedClient.authenticateApp(appAuth, function(err, response, token) {
            isolatedClient.appAuth.should.have.property('token').equal(token)
            response.body.expires_in.should.equal(ttlInMilliseconds / 1000)
            done()
        })
    })

    it('should not set client.appAuth when authenticating with a bad clientId and clientSecret in an object', function(done) {
        var failClient = new UsergridClient()
        failClient.appAuth = undefined
        failClient.authenticateApp(new UsergridAppAuth('BADCLIENTID', 'BADCLIENTSECRET'), function(e, r, token) {
            e.should.containDeep({
                name: 'invalid_grant',
                description: 'invalid username or password'
            })
            should(token).be.undefined()
            should(failClient.appAuth).be.undefined()
            done()
        })
    })

    it('should not set client.appAuth when authenticating with a bad UsergridAppAuth instance (using an object)', function(done) {
        var failClient = new UsergridClient()
        failClient.appAuth = undefined
        failClient.authenticateApp(new UsergridAppAuth('BADCLIENTID', 'BADCLIENTSECRET'), function(e, r, token) {
            e.should.containDeep({
                name: 'invalid_grant',
                description: 'invalid username or password'
            })
            should(token).be.undefined()
            should(failClient.appAuth).be.undefined()
            done()
        })
    })


    it('should not set client.appAuth when authenticating with a bad UsergridAppAuth instance (using arguments)', function(done) {
        var failClient = new UsergridClient()
        failClient.appAuth = undefined
        failClient.authenticateApp(new UsergridAppAuth('BADCLIENTID', 'BADCLIENTSECRET'), function(e, r, token) {
            e.should.containDeep({
                name: 'invalid_grant',
                description: 'invalid username or password'
            })
            should(token).be.undefined()
            should(failClient.appAuth).be.undefined()
            done()
        })
    })
})

describe('authenticateUser()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var response, token, email = util.format("%s@%s.com", chance.word(), chance.word()),
        client = new UsergridClient()
    before(function(done) {
        client.authenticateUser({
            username: config.test.username,
            password: config.test.password,
            email: email
        }, function(err, r, t) {
            response = r
            token = t
            done()
        })
    })

    it('should fail when called without a email (or username) and password', function() {
        should(function() {
            var badClient = new UsergridClient()
            badClient.authenticateUser({})
        }).throw()
    })

    it('response.ok should be true', function() {
        response.ok.should.be.true()
    })

    it('should have a valid token', function() {
        token.should.be.a.String()
        token.length.should.be.greaterThan(10)
    })

    it('client.currentUser.auth.token should be set to the token returned from Usergrid', function() {
        client.currentUser.auth.should.have.property('token').equal(token)
    })

    it('client.currentUser.auth.isValid should be true', function() {
        client.currentUser.auth.should.have.property('isValid').which.is.true()
    })

    it('client.currentUser.auth.expiry should be set to a future date', function() {
        client.currentUser.auth.should.have.property('expiry').greaterThan(Date.now())
    })

    it('client.currentUser should have a username and email', function() {
        client.currentUser.should.have.property('username')
        client.currentUser.should.have.property('email').equal(email)
    })

    it('client.currentUser and client.currentUser.auth should not store password', function() {
        client.currentUser.should.not.have.property('password')
        client.currentUser.auth.should.not.have.property('password')
    })

    it('should support an optional bool to not set as current user', function(done) {
        var noCurrentUserClient = new UsergridClient()
        noCurrentUserClient.authenticateUser({
            username: config.test.username,
            password: config.test.password,
            email: email
        }, false, function(err, r, t) {
            should(noCurrentUserClient.currentUser).be.undefined()
            done()
        })
    })

    it('should support passing a UsergridUserAuth instance with a custom ttl', function(done) {
        var newClient = new UsergridClient()
        var ttlInMilliseconds = 500000
        var userAuth = new UsergridUserAuth(config.test.username, config.test.password, ttlInMilliseconds)
        client.authenticateUser(userAuth, function(err, usergridResponse, token) {
            usergridResponse.ok.should.be.true()
            client.currentUser.auth.token.should.equal(token)
            usergridResponse.body.expires_in.should.equal(ttlInMilliseconds / 1000)
            done()
        })
    })
})

describe('appAuth, setAppAuth()', function() {
    it('should initialize by passing a list of arguments', function() {
        var client = new UsergridClient()
        client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl)
        client.appAuth.should.be.instanceof(UsergridAppAuth)
    })

    it('should be a subclass of UsergridAuth', function() {
        var client = new UsergridClient()
        client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl)
        client.appAuth.should.be.instanceof(UsergridAuth)
    })

    it('should initialize by passing an object', function() {
        var client = new UsergridClient()
        client.setAppAuth({
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            tokenTtl: config.tokenTtl
        })
        client.appAuth.should.be.instanceof(UsergridAppAuth)
    })

    it('should initialize by passing an instance of UsergridAppAuth', function() {
        var client = new UsergridClient()
        client.setAppAuth(new UsergridAppAuth(config.clientId, config.clientSecret, config.tokenTtl))
        client.appAuth.should.be.instanceof(UsergridAppAuth)
    })

    it('should initialize by setting to an instance of UsergridAppAuth', function() {
        var client = new UsergridClient()
        client.appAuth = new UsergridAppAuth(config.clientId, config.clientSecret, config.tokenTtl)
        client.appAuth.should.be.instanceof(UsergridAppAuth)
    })
})

describe('usingAuth()', function() {

    this.slow(_slow + 500)
    this.timeout(_timeout)

    var client = new UsergridClient(),
        authFromToken

    before(function(done) {
        client.authenticateUser({
            username: config.test.username,
            password: config.test.password
        }, function(error, response, token) {
            authFromToken = new UsergridAuth(token)
            done()
        })
    })

    it('should authenticate using an ad-hoc token', function(done) {
        authFromToken.isValid.should.be.true()
        authFromToken.should.have.property('token')
        client.usingAuth(authFromToken).GET({
            path: '/users/me'
        }, function(error, usergridResponse) {
            usergridResponse.ok.should.be.true()
            usergridResponse.should.have.property('user').which.is.an.instanceof(UsergridUser)
            usergridResponse.user.should.have.property('uuid').which.is.a.uuid()
            done()
        })
    })

    it('client.tempAuth should be destroyed after making a request with ad-hoc authentication', function(done) {
        should(client.tempAuth).be.undefined()
        done()
    })

    it('should send an unauthenticated request when UsergridAuth.NO_AUTH is passed to .usingAuth()', function(done) {
        client.usingAuth(UsergridAuth.NO_AUTH).GET({
            path: '/users/me'
        }, function(error, usergridResponse) {
            usergridResponse.ok.should.be.false()
            usergridResponse.request.headers.should.not.have.property('authentication')
            usergridResponse.should.not.have.property('user')
            done()
        })
    })

    it('should send an unauthenticated request when no arguments are passed to .usingAuth()', function(done) {
        client.usingAuth().GET({
            path: '/users/me'
        }, function(error, usergridResponse) {
            usergridResponse.ok.should.be.false()
            usergridResponse.request.headers.should.not.have.property('authentication')
            usergridResponse.should.not.have.property('user')
            done()
        })
    })
})