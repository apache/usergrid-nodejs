'use strict'

var should = require('should'),
    config = require('../../helpers').config,
    Usergrid = require('../../usergrid'),
    UsergridClient = require('../../lib/client'),
    util = require('util'),
    _ = require('lodash') 

describe('init() / initSharedInstance()', function() {
    it('should be an instance of UsergridClient', function() {
        Usergrid.init()
        Usergrid.initSharedInstance()
        Usergrid.should.be.an.instanceof(UsergridClient)
    })
    
    it(util.format('should be testing against a Usergrid v%s instance', config.target), function() {
        util.format('--target=%s', config.target).should.equal(_.last(process.argv))
    })
})