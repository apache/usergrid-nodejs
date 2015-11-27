'use strict'

var should = require('should'),
    config = require('../../config.json'),
    Usergrid = require('../../usergrid'),
    UsergridClient = require('../../lib/client')

describe('init() / initSharedInstance()', function() {
    it('should fail to initialize without an orgId and appId', function() {
        should(function() {
            Usergrid.init(null, null)
        }).throw()
    })

    it('should initialize when passing an orgId and appId', function(done) {
        Usergrid.init(config.usergrid.orgId, config.usergrid.appId)
        done()
    })

    it('should initialize using orgId and appId from config.json', function(done) {
        Usergrid.init()
        done()
    })

    it('should contain and match all properties defined in config.json', function(done) {
        Object(Usergrid).should.containDeep(config.usergrid)
        done()
    })

    it('should be an instance of UsergridClient', function(done) {
        Usergrid.should.be.an.instanceof(UsergridClient)
        done()
    })

    it('should have default values set for non-init-time properties', function() {
        Usergrid.paginationPreloadPages.should.equal(0)
        Usergrid.paginationCacheTimeout.should.equal(300 * 1000)
        Usergrid.paginationCursors.should.be.an.Array.with.a.lengthOf(0)
    })
})