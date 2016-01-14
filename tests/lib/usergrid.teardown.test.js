'use strict'

var should = require('should'),
    Usergrid = require('../../usergrid'),
    UsergridClient = require('../../lib/client')

it('should be destroyed', function(done) {
    // destroy shared instance to prevent other tests from defaulting to use the shared instance
    var UsergridRef = require.resolve('../../usergrid')
    delete require.cache[UsergridRef]
    Usergrid = require('../../usergrid')
    Usergrid.should.have.property('isInitialized').which.is.false()
    Usergrid.should.not.be.an.instanceof(UsergridClient)
    done()
})