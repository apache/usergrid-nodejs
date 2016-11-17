/*
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

'use strict'

var config = require('../../helpers').config,
    Usergrid = require('../../usergrid'),
    UsergridClient = require('../../lib/client'),
    util = require('util'),
    _ = require('lodash') 

describe('init() / initSharedInstance()', function() {
    it('should be an instance of UsergridClient', function(done) {
        Usergrid.init()
        Usergrid.initSharedInstance()
        Usergrid.should.be.an.instanceof(UsergridClient)
        done()
    })
    
    it(util.format('should be testing against a Usergrid v%s instance', config.target), function(done) {
        util.format('%s', config.target).should.equal((_.last(process.argv)).startsWith('--target=') ? _.last(process.argv).replace(/--target=/, '') : '2.1')
        done()
    })
})