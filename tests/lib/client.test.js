'use strict'

var should = require('should'),
    urljoin = require('url-join'),
    config = require('../../helpers').config,
    UsergridClient = require('../../lib/client'),
    UsergridEntity = require('../../lib/entity'),
    UsergridQuery = require('../../lib/query'),
    UsergridAuth = require('../../lib/auth'),
    UsergridAppAuth = require('../../lib/appAuth'),
    _ = require('lodash')

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

    it('should not set client.appAuth when authenticating with a bad UsergridAppAuth instance (using an object)', function(done) {
        var failClient = new UsergridClient()
        failClient.authenticateApp(new UsergridAppAuth({
            clientId: 'BADCLIENTID',
            clientSecret: 'BADCLIENTSECRET'
        }), function(e, r, token) {
            should(token).be.undefined()
            should(failClient.appAuth).be.undefined()
            done()
        })
    })

    it('should not set client.appAuth when authenticating with a bad UsergridAppAuth instance (using arguments)', function(done) {
        var failClient = new UsergridClient()
        failClient.authenticateApp(new UsergridAppAuth('BADCLIENTID', 'BADCLIENTSECRET'), function(e, r, token) {
            should(token).be.undefined()
            should(failClient.appAuth).be.undefined()
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
})

describe('authenticateUser()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var response, token, client = new UsergridClient()
    before(function(done) {
        client.authenticateUser({
            username: config.test.username,
            password: config.test.password
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

    it('client.currentUser should have a username', function() {
        client.currentUser.should.have.property('username')
    })

    it('client.currentUser should have an email', function() {
        client.currentUser.should.have.property('email')
    })

    it('client.currentUser and client.currentUser.auth should not store password', function() {
        client.currentUser.should.not.have.property('password')
        client.currentUser.auth.should.not.have.property('password')
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