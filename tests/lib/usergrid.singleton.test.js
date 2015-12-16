'use strict'

var should = require('should'),
    Usergrid = require('../../usergrid')

it('should be initialized when defined in another module', function() {
    Usergrid.isInitialized.should.be.true()
})