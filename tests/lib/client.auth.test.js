'use strict'

var should = require('should'),
    chance = new require('chance').Chance(),
    urljoin = require('url-join'),
    util = require('util'),
    config = require('../../helpers').config,
    UsergridClient = require('../../lib/client'),
    UsergridEntity = require('../../lib/entity'),
    UsergridQuery = require('../../lib/query'),
    UsergridAuth = require('../../lib/auth'),
    UsergridAppAuth = require('../../lib/appAuth'),
    UsergridUserAuth = require('../../lib/userAuth'),
    _ = require('lodash')

_.mixin(require('lodash-uuid'))

var _uuid,
    _slow = 500,
    _timeout = 4000

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

    it('should return a 200 ok', function() {
        response.statusCode.should.equal(200)
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
        failClient.authenticateApp({
            clientId: 'BADCLIENTID',
            clientSecret: 'BADCLIENTSECRET'
        }, function(e, r, token) {
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
        failClient.authenticateApp(new UsergridAppAuth({
            clientId: 'BADCLIENTID',
            clientSecret: 'BADCLIENTSECRET'
        }), function(e, r, token) {
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

    var response, token, email = util.format("%s@%s.com", chance.word(), chance.word()), client = new UsergridClient()
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
            var client = new UsergridClient()
            client.authenticateUser({})
        }).throw()
    })

    it('should return a 200 ok', function() {
        response.statusCode.should.equal(200)
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

    it('should support passing a UsergridUserAuth instance with a custom ttl', function(done) {
        var newClient = new UsergridClient()
        var ttlInMilliseconds = 500000        
        var userAuth = new UsergridUserAuth(config.test.username, config.test.password, ttlInMilliseconds)
        client.authenticateUser(userAuth, function(err, response, token) {
            response.statusCode.should.equal(200)
            client.currentUser.auth.token.should.equal(token)
            response.body.expires_in.should.equal(ttlInMilliseconds / 1000)
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