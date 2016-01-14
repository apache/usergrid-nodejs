'use strict'

var should = require('should'),
    Usergrid = require('../../usergrid')

it('should be initialized when defined in another module', function(done) {
    Usergrid.should.have.property('isInitialized').which.is.true()
    Usergrid.should.have.property('isSharedInstance').which.is.true()
    done()
})