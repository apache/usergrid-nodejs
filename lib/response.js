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

var UsergridQuery = require('./query'),
    UsergridResponseError = require('./responseError'),
    helpers = require('../helpers'),
    _ = require('lodash')

var UsergridResponse = function(response) {
    var self = this
    self.ok = false
    if (!response) {
        return
    } else if (response.statusCode < 400) {
        self.ok = true
        var UsergridEntity = require('./entity.js'),
            UsergridUser = require('./user.js')
        
        _.assign(self, response)

        if (_.has(response,'body.entities')) {
            var entities = response.body.entities.map(function(en) {
                var entity = new UsergridEntity(en)
                if (entity.isUser) {
                    entity = new UsergridUser(entity)
                }
                return entity
            })
            _.assign(self, {
                metadata: _.cloneDeep(response.body),
                entities: entities
            })
            delete self.metadata.entities
            self.first = _.first(entities) || undefined
            self.entity = self.first
            self.last = _.last(entities) || undefined   
            if (_.get(self,'metadata.path') === '/users') {
                self.user = self.first
                self.users = self.entities
            }

            Object.defineProperty(self, 'hasNextPage', {
                get: function() {
                    return _.has(self,'metadata.cursor')
                }
            })

            helpers.setReadOnly(self.metadata)
        }
    } else {
        _.assign(self, response, {
            error: new UsergridResponseError(response.body)
        })
    }
    return self;
}

UsergridResponse.prototype = {
    loadNextPage: function() {
        var args = helpers.args(arguments)
        var callback = helpers.cb(args)
        if (!this.metadata.cursor) {
            callback()
        }
        var client = helpers.client.validate(args)
        var type = _.last(_.get(this,'metadata.path').split('/'))
        var limit = _.first(_.get(this,'metadata.params.limit'))
        var ql =  _.first(_.get(this,'metadata.params.ql'))
        var query = new UsergridQuery(type).fromString(ql).cursor(this.metadata.cursor).limit(limit)
        return client.GET(query, callback)
    }
}

module.exports = UsergridResponse