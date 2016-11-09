'use strict'

var should = require('should'),
    util = require('util'),
    chance = new require('chance').Chance(),
    config = require('../../helpers').config,
    UsergridClient = require('../../lib/client'),
    UsergridUser = require('../../lib/user'),
    UsergridQuery = require('../../lib/query'),
    _ = require('lodash')

var _slow = 1500,
    _timeout = 4000,
    _username1 = chance.word(),
    _user1 = new UsergridUser({
        username: _username1,
        password: config.test.password
    }),
    client = new UsergridClient(config)

before(function(done) {

    this.slow(_slow)
    this.timeout(_timeout)

    var query = new UsergridQuery('users').not.eq('username', config.test.username).limit(20)
    // clean up old user entities as the UsergridResponse tests rely on this collection containing less than 10 entities
    client.DELETE(query, function() {
        _user1.create(client, function(err, usergridResponse, user) {
            done()
        })
    })
})

describe('create()', function() {

    it(util.format("should create a new user with the username '%s'", _username1), function() {
        _user1.username.should.equal(_username1)
    })

    it('should have a valid uuid', function() {
        _user1.should.have.property('uuid').which.is.a.uuid()
    })

    it('should have a created date', function() {
        _user1.should.have.property('created')
    })

    it('should be activated (i.e. has a valid password)', function() {
        _user1.should.have.property('activated').true()
    })

    it('should not have a password property', function() {
        _user1.should.not.have.property('password')
    })

    it('should fail gracefully when a username already exists', function(done) {
        var user = new UsergridUser({
            username: _username1,
            password: config.test.password
        })
        user.create(client, function(err, usergridResponse) {
            err.should.not.be.null()
            err.should.containDeep({
                name: 'duplicate_unique_property_exists'
            })
            usergridResponse.ok.should.be.false()
            done()
        })
    })

    it('should create a new user on the server', function(done) {
        var username = chance.word()
        var user = new UsergridUser({
            username: username,
            password: config.test.password
        })
        user.create(client, function(err, usergridResponse, user) {
            client.isSharedInstance.should.be.false()
            user.username.should.equal(username)
            user.should.have.property('uuid').which.is.a.uuid()
            user.should.have.property('created')
            user.should.have.property('activated').true()
            user.should.not.have.property('password')
                // cleanup
            user.remove(client, function(err, response) {
                done()
            })
        })
    })
})

describe('login()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    it(util.format("it should log in the user '%s' and receive a token", _username1), function(done) {
        _user1.password = config.test.password
        _user1.login(client, function(err, response, token) {
            _user1.auth.should.have.property('token').equal(token)
            _user1.should.not.have.property('password')
            _user1.auth.should.not.have.property('password')
            done()
        })
    })
})

describe('logout()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    it(util.format("it should log out '%s' and destroy the saved UsergridUserAuth instance", _username1), function(done) {
        _user1.logout(client, function(err, response, success) {
            response.ok.should.be.true()
            response.body.action.should.equal("revoked user token")
            _user1.auth.isValid.should.be.false()
            done()
        })
    })

    it("it should return an error when attempting to log out a user that does not have a valid token", function(done) {
        _user1.logout(client, function(err, response, success) {
            err.should.containDeep({
                name: 'no_valid_token'
            })
            done()
        })
    })
})

describe('logoutAllSessions()', function() {
    it(util.format("it should log out all tokens for the user '%s' destroy the saved UsergridUserAuth instance", _username1), function(done) {
        _user1.password = config.test.password
        _user1.login(client, function(err, response, token) {
            _user1.logoutAllSessions(client, function(err, response, success) {
                response.ok.should.be.true()
                response.body.action.should.equal("revoked user tokens")
                _user1.auth.isValid.should.be.false()
                done()
            })
        })
    })
})

describe('resetPassword()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    it(util.format("it should reset the password for '%s' by passing parameters", _username1), function(done) {
        _user1.resetPassword(client, config.test.password, '2cool4u', function(err, response, success) {
            response.ok.should.be.true()
            response.body.action.should.equal("set user password")
            done()
        })
    })

    it(util.format("it should reset the password for '%s' by passing an object", _username1), function(done) {
        _user1.resetPassword(client, {
            oldPassword: '2cool4u',
            newPassword: config.test.password
        }, function(err, response, success) {
            response.ok.should.be.true()
            response.body.action.should.equal("set user password")
            done()
        })
    })

    it(util.format("it should not reset the password for '%s' when passing a bad old password", _username1), function(done) {
        _user1.resetPassword(client, {
            oldPassword: 'BADOLDPASSWORD',
            newPassword: config.test.password
        }, function(err, response, success) {
            response.ok.should.be.false()
            err.name.should.equal('auth_invalid_username_or_password')
            _user1.remove(client, function(err, response) {
                done()
            })
        })
    })

    it("it should return an error when attempting to reset a password with missing arguments", function() {
        should(function() {
            _user1.resetPassword(client, 'NEWPASSWORD', function() {})
        }).throw()
    })
})

describe('CheckAvailable()', function() {

    this.slow(_slow)
    this.timeout(_timeout)

    var nonExistentEmail = util.format('%s@%s.com', chance.word(), chance.word())
    var nonExistentUsername = chance.word()

    it(util.format("it should return true for username '%s'", config.test.username), function(done) {
        UsergridUser.CheckAvailable(client, {
            username: config.test.username
        }, function(err, response, exists) {
            exists.should.be.true()
            done()
        })
    })

    it(util.format("it should return true for email '%s'", config.test.email), function(done) {
        UsergridUser.CheckAvailable(client, {
            email: config.test.email
        }, function(err, response, exists) {
            exists.should.be.true()
            done()
        })
    })

    it(util.format("it should return true for email '%s' and non-existent username '%s'", config.test.email, nonExistentUsername), function(done) {
        UsergridUser.CheckAvailable(client, {
            email: config.test.email,
            username: nonExistentUsername
        }, function(err, response, exists) {
            exists.should.be.true()
            done()
        })
    })

    it(util.format("it should return true for non-existent email '%s' and username '%s'", nonExistentEmail, config.test.username), function(done) {
        UsergridUser.CheckAvailable(client, {
            email: nonExistentEmail,
            username: config.test.username
        }, function(err, response, exists) {
            exists.should.be.true()
            done()
        })
    })

    it(util.format("it should return true for email '%s' and username '%s'", config.test.email, config.test.username), function(done) {
        UsergridUser.CheckAvailable(client, {
            email: config.test.email,
            username: config.test.useranme
        }, function(err, response, exists) {
            exists.should.be.true()
            done()
        })
    })

    it(util.format("it should return false for non-existent email '%s'", nonExistentEmail), function(done) {
        UsergridUser.CheckAvailable(client, {
            email: nonExistentEmail
        }, function(err, response, exists) {
            exists.should.be.false()
            done()
        })
    })

    it(util.format("it should return false for non-existent username '%s'", nonExistentUsername), function(done) {
        UsergridUser.CheckAvailable(client, {
            username: nonExistentUsername
        }, function(err, response, exists) {
            exists.should.be.false()
            done()
        })
    })

    it(util.format("it should return false for non-existent email '%s' and non-existent username '%s'", nonExistentEmail, nonExistentUsername), function(done) {
        UsergridUser.CheckAvailable(client, {
            email: nonExistentEmail,
            username: nonExistentUsername
        }, function(err, response, exists) {
            exists.should.be.false()
            done()
        })
    })
})