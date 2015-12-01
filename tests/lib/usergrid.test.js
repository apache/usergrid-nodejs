'use strict'

var should = require('should'),
    Usergrid = require('../../usergrid'),
    UsergridClient = require('../../lib/client')

describe('init() / initSharedInstance()', function() {
    it('should be an instance of UsergridClient', function() {
        Usergrid.init()
        Usergrid.should.be.an.instanceof(UsergridClient)
    })
})