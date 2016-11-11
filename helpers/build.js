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

var urljoin = require('url-join'),
    config = require('./config'),
    helpers = require('./'),
    UsergridQuery = require('../lib/query'),
    UsergridEntity = require('../lib/entity'),
    UsergridAuth = require('../lib/auth'),
    UsergridAsset = require('../lib/asset'),
    util = require('util'),
    version = require('../package.json').version,
    _ = require('lodash')

var assignPrefabOptions = function(args) {
    // if a preformatted options argument passed, assign it to options
    if (_.isObject(args[0]) && !_.isFunction(args[0]) && _.has(this,"method")) {
        _.assign(this, args[0])
    }
    return this
}

var setEntity = function(args) {
    this.entity = _.first([this.entity, args[0]].filter(function(property) {
        return (property instanceof UsergridEntity)
    }))
    if (this.entity !== undefined) {
        this.type = this.entity.type
    }
    return this
}

var setAsset = function(args) {
    this.asset = _.first([this.asset, _.get(this,'entity.asset'), args[1], args[0]].filter(function(property) {
        return (property instanceof UsergridAsset)
    }))
    return this
}

var setUuidOrName = function(args) {
    this.uuidOrName = _.first([
        this.uuidOrName,
        this.uuid,
        this.name,
        _.get(this,'entity.uuid'),
        _.get(this,'body.uuid'),
        _.get(this,'entity.name'),
        _.get(this,'body.name'),
        _.get(args,'2'),
        _.get(args,'1')
    ].filter(_.isString))
    return this
}

var setPathOrType = function(args) {
    var pathOrType = _.first([
        this.type,
        _.get(args,'0._type'),
        _.get(this,'entity.type'),
        _.get(this,'body.type'),
        _.get(this,'body.0.type'),
        _.isArray(args) ? args[0] : undefined
    ].filter(_.isString))
    this[(/\//.test(pathOrType)) ? 'path' : 'type'] = pathOrType
    return this
}

var setQs = function(args) {
    if (this.path) {
        this.qs = _.first([this.qs, args[2], args[1], args[0]].filter(_.isPlainObject))
    }
    return this
}

var setQuery = function(args) {
    this.query = _.first([this.query, args[0]].filter(function(property) {
        return (property instanceof UsergridQuery)
    }))
    return this
}

var setBody = function(args) {
    this.body = _.first([this.entity, this.body, args[2], args[1], args[0]].filter(function(property) {
        return _.isObject(property) && !_.isFunction(property) && !(property instanceof UsergridQuery) && !(property instanceof UsergridAsset)
    }))
    if (this.body === undefined && this.asset === undefined) {
        throw new Error(util.format('"body" is required when making a %s request', this.method))
    }
    return this
}

module.exports = {
    uri: function(client, options) {
        return urljoin(
            client.baseUrl,
            client.orgId,
            client.appId,
            options.path || options.type,
            options.method !== "POST" ? _.first([
                options.uuidOrName,
                options.uuid,
                options.name,
                _.get(options,'entity.uuid'),
                _.get(options,'entity.name'),
                ""
            ].filter(_.isString)) : ""
        )
    },
    headers: function(client, options) {
        var headers = {
            'User-Agent': util.format("usergrid-nodejs/v%s", version)
        }

        _.assign(headers, options.headers)

        var token
        var clientTempAuth = _.get(client,"tempAuth")
        if( !_.isUndefined(clientTempAuth) ) {
            if( clientTempAuth !== UsergridAuth.NO_AUTH && clientTempAuth.isValid ) {
                token = client.tempAuth.token;
            }
            client.tempAuth = undefined
        } else {
            var clientAuthMode = _.get(client,"authMode");
            if( _.get(client,"currentUser.auth.isValid") && clientAuthMode === UsergridAuth.AUTH_MODE_USER ) {
                token = client.currentUser.auth.token;
            } else if( _.get(client,"appAuth.isValid") && clientAuthMode === UsergridAuth.AUTH_MODE_APP ) {
                token = client.appAuth.token;
            }
        }

        if (token) {
            _.assign(headers, {
                authorization: util.format("Bearer %s", token)
            })
        }

        return headers
    },
    userLoginBody: function(options) {
        var body = {
            grant_type: 'password',
            password: options.password
        }
        if (options.tokenTtl) {
            body.ttl = options.tokenTtl
        }
        body[(options.username) ? "username" : "email"] = (options.username) ? options.username : options.email
        return body
    },
    appLoginBody: function(options) {
        var body = {
            grant_type: 'client_credentials',
            client_id: options.clientId,
            client_secret: options.clientSecret
        }
        if (options.tokenTtl) {
            body.ttl = options.tokenTtl
        }
        return body
    },
    GET: function(client, args) {

        /* GET supports the following constructor patterns:

        client.GET('type', 'uuidOrName', optionalCallback)
        client.GET('type', optionalCallback)
        client.GET(query, optionalCallback)
        client.GET({
            query: query, // takes precedence
            type: type, // required if query not defined
            uuid: uuid, // will be set to uuidOrName on init (priority)
            name: name, // will be set to uuidOrName on init (if no uuid specified)
            uuidOrName: uuidOrName // the definitive key for name or uuid
        }, optionalCallback)

        */

        var options = {
            client: client,
            method: 'GET',
            callback: helpers.cb(args)
        }
        assignPrefabOptions.call(options, args)
        setEntity.call(options, args)
        setUuidOrName.call(options, args)
        setPathOrType.call(options, args)
        setQs.call(options, args)
        setQuery.call(options, args)
        return options
    },
    PUT: function(client, args) {

        /* PUT supports the following constructor patterns:

        client.PUT('type', 'uuidOrName', bodyObject, optionalCallback)
        client.PUT('type', bodyObject, optionalCallback) // if no uuid, will create a new record
        client.PUT(bodyObjectOrEntity, optionalCallback) // if no uuid, will create a new record; must include type
        client.PUT(query, bodyObjectOrEntity, optionalCallback) // will update all entities matching query
        client.PUT(entity, optionalCallback)
        client.PUT({
            *entity = alias to body*
            query: query, // takes precedence over type/body
            type: type, // required if query not defined
            body: bodyObject or bodyObjectOrEntity, // if includes type, type will be inferred from body
            *uuid, name* = alias to uuidOrName*
            uuidOrName: uuidOrName // the definitive key for name or uuid
        }, optionalCallback)

        */

        var options = {
            client: client,
            method: 'PUT',
            callback: helpers.cb(args)
        }
        assignPrefabOptions.call(options, args)
        setEntity.call(options, args)
        setAsset.call(options, args)
        setBody.call(options, args)
        setUuidOrName.call(options, args)
        setPathOrType.call(options, args)
        setQuery.call(options, args)
        return options
    },
    POST: function(client, args) {

        /* POST supports the following constructor patterns:

        client.POST('type', bodyObjectOrArray, optionalCallback)
        client.POST(bodyObjectOrArray, optionalCallback) // must include type in body
        client.POST(entityOrEntities, optionalCallback)
        client.POST({
            *entity, entities = alias to body*
            type: type, // required
            body: bodyObjectOrArray or entityOrEntities, // if the first entity includes type, type will be inferred from body
        }, optionalCallback)

        */

        var options = {
            client: client,
            method: 'POST',
            callback: helpers.cb(args)
        }
        assignPrefabOptions.call(options, args)
        setEntity.call(options, args)
        setAsset.call(options, args)
        setBody.call(options, args)
        setPathOrType.call(options, args)
        return options
    },
    DELETE: function(client, args) {

        /* DELETE supports the following constructor patterns:

        client.DELETE('type', 'uuidOrName', optionalCallback)
        client.DELETE(entity, optionalCallback) // must include type in body
        client.DELETE(query, optionalCallback)
        client.DELETE({
            *uuid, name* = alias to uuidOrName*
            uuidOrName: uuidOrName,
            type: type, // required if query not defined
            query: query // takes precedence over type/uuid
        }, optionalCallback)

        */

        var options = {
            client: client,
            method: 'DELETE',
            callback: helpers.cb(args)
        }
        assignPrefabOptions.call(options, args)
        setEntity.call(options, args)
        setUuidOrName.call(options, args)
        setPathOrType.call(options, args)
        setQs.call(options, args)
        setQuery.call(options, args)
        return options
    },
    connection: function(client, method, args) {

        /* connect supports the following constructor patterns:

        client.connect(entity, "relationship", toEntity);
        // POST entity.type/entity.uuid/"relationship"/toEntity.uuid

        client.connect("type", <uuidOrName>, "relationship", <toUuid>);
        // POST type/uuidOrName/relationship/toUuid

        client.connect("type", <uuidOrName>, "relationship", "toType", "toName");
        // POST type/uuidOrName/relationship/toType/toName

        client.connect({
            entity: { // or UsergridEntity
                type: "type", 
                uuidOrName: <uuidOrName>
            },
            relationship: "likes",
            to: { // or UsergridEntity
                "type": "(required if not using uuid)",
                "uuidOrName": <uuidOrName>,
                "name": "alias to uuidOrName" // if uuid not specified, requires "type"
                "uuid": "alias to uuidOrName" 
            }
        );

        disconnect supports the identical patters, but uses DELETE instead of POST; it is therefore a reference to this function

        */

        var options = {
            client: client,
            method: method,
            entity: {},
            to: {},
            callback: helpers.cb(args)
        }

        assignPrefabOptions.call(options, args)

        // handle DELETE using "from" preposition
        if (_.isObject(options.from)) {
            options.to = options.from
        }

        // if an entity object or UsergridEntity instance is the first argument (source)
        if (_.isObject(args[0]) && !_.isFunction(args[0]) && _.isString(args[1])) {
            _.assign(options.entity, args[0])
            options.relationship = _.first([options.relationship, args[1]].filter(_.isString))
        }

        // if an entity object or UsergridEntity instance is the third argument (target)
        if (_.isObject(args[2]) && !_.isFunction(args[2])) {
            _.assign(options.to, args[2])
        }

        options.entity.uuidOrName = _.first([options.entity.uuidOrName, options.entity.uuid, options.entity.name, args[1]].filter(_.isString))
        if (!options.entity.type) {
            options.entity.type = _.first([options.entity.type, args[0]].filter(_.isString))
        }
        options.relationship = _.first([options.relationship, args[2]].filter(_.isString))

        if (_.isString(args[3]) && !_.isUuid(args[3]) && _.isString(args[4])) {
            options.to.type = args[3]
        } else if (_.isString(args[2]) && !_.isUuid(args[2]) && _.isString(args[3]) && _.isObject(args[0]) && !_.isFunction(args[0])) {
            options.to.type = args[2]
        }

        options.to.uuidOrName = _.first([options.to.uuidOrName, options.to.uuid, options.to.name, args[4], args[3], args[2]].filter(function(property) {
            return (_.isString(options.to.type) && _.isString(property) || _.isUuid(property))
        }))

        if (!_.isString(options.entity.uuidOrName)) {
            throw new Error('source entity "uuidOrName" is required when connecting or disconnecting entities')
        }

        if (!_.isString(options.to.uuidOrName)) {
            throw new Error('target entity "uuidOrName" is required when connecting or disconnecting entities')
        }

        if (!_.isString(options.to.type) && !_.isUuid(options.to.uuidOrName)) {
            throw new Error('target "type" (collection name) parameter is required connecting or disconnecting entities by name')
        }

        options.uri = urljoin(
            config.baseUrl,
            client.orgId,
            client.appId,
            _.isString(options.entity.type) ? options.entity.type : "",
            _.isString(options.entity.uuidOrName) ? options.entity.uuidOrName : "",
            options.relationship,
            _.isString(options.to.type) ? options.to.type : "",
            _.isString(options.to.uuidOrName) ? options.to.uuidOrName : ""
        )

        return options
    },
    getConnections: function(client, args) {
        /* getConnections supports the following constructor patterns:

        client.getConnections(direction, entity, "relationship");
        // GET OUT: /entity.type/entity.uuid/connections/relationship
        // GET IN: /entity.type/entity.uuid/connecting/relationship

        client.getConnections(direction, "type", "<uuidOrName>", "relationship");
        // GET OUT: /type/uuidOrName/connections/relationship
        // GET IN: /type/uuidOrName/connecting/relationship

        client.getConnections({
            type: "type", // or inferred, if second argument is an entity
            uuidOrName: "<uuidOrName>" // if entity not specified
            relationship: "relationship",
            direction: OUT or IN
        );
        // GET OUT: /entity.type/entity.uuid/connections/relationship
        // GET IN: /entity.type/entity.uuid/connecting/relationship

        */

        var options = {
            client: client,
            method: 'GET',
            callback: helpers.cb(args)
        }

        assignPrefabOptions.call(options, args)
        if (_.isObject(args[1]) && !_.isFunction(args[1])) {
            _.assign(options, args[1])
        }

        options.direction = _.first([options.direction, args[0]].filter(function(property) {
            return (property === "IN" || property === "OUT")
        }))

        options.relationship = _.first([options.relationship, args[3], args[2]].filter(_.isString))
        options.uuidOrName = _.first([options.uuidOrName, options.uuid, options.name, args[2]].filter(_.isString))
        options.type = _.first([options.type, args[1]].filter(_.isString))

        if (!_.isString(options.type)) {
            throw new Error('"type" (collection name) parameter is required when retrieving connections')
        }

        if (!_.isString(options.uuidOrName)) {
            throw new Error('target entity "uuidOrName" is required when retrieving connections')
        }

        options.uri = urljoin(
            config.baseUrl,
            client.orgId,
            client.appId,
            _.isString(options.type) ? options.type : "",
            _.isString(options.uuidOrName) ? options.uuidOrName : "",
            options.direction === "IN" ? "connecting" : "connections",
            options.relationship
        )

        return options
    },
    qs: function(options) {
        return (options.query instanceof UsergridQuery) ? {
            ql: options.query._ql || undefined,
            limit: options.query._limit,
            cursor: options.query._cursor
        } : options.qs
    },
    formData: function(options) {
        if (_.get(options,'asset.data')) {
            var formData = {}
            formData.file = {
                value: options.asset.data,
                options: {
                    filename: _.get(options,'asset.filename') || UsergridAsset.DEFAULT_FILE_NAME,
                    contentType: _.get(options,'asset.contentType') || 'application/octet-stream'
                }
            } 
            if (_.has(options,'asset.name')) {
                formData.name = options.asset.name
            }
            return formData
        } else {
            return undefined
        }
    }
}