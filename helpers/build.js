'use strict'

var urljoin = require('url-join'),
    config = require('./config'),
    helpers = require('./'),
    UsergridQuery = require('../lib/query'),
    UsergridEntity = require('../lib/entity'),
    UsergridAuth = require('../lib/auth'),
    util = require('util'),
    version = require('../package.json').version,
    ok = require('objectkit'),
    _ = require('lodash')

module.exports = {
    url: function(client, options) {
        return urljoin(
            client.baseUrl,
            client.orgId,
            client.appId,
            options.type,
            _.isString(options.uuidOrName) ? options.uuidOrName : ""
        )
    },
    headers: function(client, auth) {
        var headers = {
            'User-Agent': util.format("usergrid-nodejs/v%s", version)
        }
        if (ok(auth).getIfExists('isValid')) {
            // checks if an auth param was passed to the request and uses the token if applicable
            _.assign(headers, {
                authorization: util.format("Bearer %s", auth.token)
            })
        } else if (ok(client).getIfExists('authFallback') === UsergridAuth.AuthFallback.APP && ok(client).getIfExists('appAuth.isValid')) {
            // if auth-fallback is set to APP, this request will make a call using the application token
            _.assign(headers, {
                authorization: util.format("Bearer %s", client.appAuth.token)
            })
        } else if (ok(client).getIfExists('currentUser.auth.isValid')) {
            // defaults to using the current user's token
            _.assign(headers, {
                authorization: util.format("Bearer %s", client.currentUser.auth.token)
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
            uuid: uuid, // will be set to nameOrUuid on init (priority)
            name: name, // will be set to nameOrUuid on init (if no uuid specified)
            nameOrUuid: nameOrUuid // the definitive key for name or uuid
        }, optionalCallback)

        */

        var options = {
            client: client,
            method: 'GET'
        }

        // if a preformatted options argument passed, assign it to options
        if (_.isObject(args[0]) && !_.isFunction(args[0]) && args.length <= 2) {
            _.assign(options, args[0])
        }

        options.callback = helpers.cb(_.last(args.filter(_.isFunction)))

        options.type = _.first([options.type, ok(args).getIfExists('0._type'), args[0]].filter(_.isString))

        options.query = _.first([options.query, args[0]].filter(function(property) {
            return (property instanceof UsergridQuery)
        }))
        options.uuidOrName = _.last([options.uuidOrName, options.uuid, options.name, args[1]].filter(function(property) {
            return (property)
        }))

        options.entity = _.first([options.entity, args[0]].filter(function(property) {
            return (property instanceof UsergridEntity)
        }))

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
            *uuid, name* = alias to nameOrUuid*
            nameOrUuid: nameOrUuid // the definitive key for name or uuid
        }, optionalCallback)

        */

        var options = {
            client: client,
            method: 'PUT'
        }

        // if a preformatted options argument passed, assign it to options
        if (_.isObject(args[0]) && !_.isFunction(args[0]) && args.length <= 2) {
            _.assign(options, args[0])
        }

        options.callback = helpers.cb(_.last(args.filter(_.isFunction)))

        options.body = _.first([options.entity, options.body, args[2], args[1], args[0]].filter(function(property) {
            return _.isObject(property) && !_.isFunction(property) && !(property instanceof UsergridQuery)
        }))

        if (typeof options.body !== 'object') {
            throw new Error('"body" parameter is required when making a PUT request')
        }

        options.uuidOrName = _.first([options.nameOrUuid, options.uuid, options.name, options.body.uuid, args[2], args[1], args[0]].filter(_.isString))

        options.type = _.first([options.type, args[0]._type, options.body.type, args[0]].filter(_.isString))
        options.query = _.first([options.query, args[0]].filter(function(property) {
            return (property instanceof UsergridQuery)
        }))

        options.entity = _.first([options.entity, args[0]].filter(function(property) {
            return (property instanceof UsergridEntity)
        }))

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
            method: 'POST'
        }

        // if a preformatted options argument passed, assign it to options
        if (_.isObject(args[0]) && !_.isFunction(args[0]) && args.length <= 2) {
            _.assign(options, args[0])
        }

        options.callback = helpers.cb(_.last(args.filter(_.isFunction)))

        options.body = _.first([options.entities, options.entity, options.body, args[1], args[0]].filter(function(property) {
            return _.isArray(property) && _.isObject(property[0]) && !_.isFunction(property[0]) || _.isObject(property) && !_.isFunction(property)
        }))

        if (typeof options.body !== 'object') {
            throw new Error('"body" parameter is required when making a POST request')
        }

        options.type = _.first([options.type, args[0], ok(options).getIfExists('body.0.type'), options.body.type].filter(_.isString))

        return options
    },
    DELETE: function(client, args) {

        /* DELETE supports the following constructor patterns:

        client.DELETE('type', 'uuidOrName', optionalCallback)
        client.DELETE(entity, optionalCallback) // must include type in body
        client.DELETE(query, optionalCallback)
        client.DELETE({
            *uuid, name* = alias to nameOrUuid*
            uuidOrName: uuidOrName,
            type: type, // required if query not defined
            query: query // takes precedence over type/uuid
        }, optionalCallback)

        */

        var options = {
            client: client,
            method: 'DELETE'
        }

        // if a preformatted options argument passed, assign it to options
        if (_.isObject(args[0]) && !_.isFunction(args[0]) && args.length <= 2) {
            _.assign(options, args[0])
        }

        options.callback = helpers.cb(_.last(args.filter(_.isFunction)))
        options.type = _.first([options.type, ok(options).getIfExists('entity.type'), args[0]._type, args[0]].filter(_.isString))
        options.entity = _.first([options.entity, args[0]].filter(function(property) {
            return (property instanceof UsergridEntity)
        }))

        options.query = _.first([options.query, args[0]].filter(function(property) {
            return (property instanceof UsergridQuery)
        }))

        options.uuidOrName = _.first([options.uuidOrName, options.uuid, options.name, ok(options).getIfExists('entity.uuid'), args[1]].filter(_.isString))

        if (!_.isString(options.uuidOrName) && options.query === undefined) {
            throw new Error('"uuidOrName" parameter or "query" is required when making a DELETE request')
        }

        return options
    },
    connection: function(client, args) {

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
            entity: {},
            to: {},
            callback: helpers.cb(_.last(args.filter(_.isFunction)))
        }

        // if a preformatted options argument passed, assign it to options
        if (_.isObject(args[0]) && !_.isFunction(args[0]) && args.length <= 2) {
            _.assign(options, args[0])
        }

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

        options.to.uuidOrName = _.first([options.to.uuidOrName, options.to.uuid, options.to.name, args[4], args[3], args[2]].filter(function(u) {
            return (_.isString(options.to.type) && _.isString(u) || _.isUuid(u))
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
            callback: helpers.cb(_.last(args.filter(_.isFunction)))
        }

        // if a preformatted options argument passed, assign it to options
        if (_.isObject(args[0]) && !_.isFunction(args[0]) && args.length <= 2) {
            _.assign(options, args[0])
        } else if (_.isObject(args[1]) && !_.isFunction(args[1])) {
            _.assign(options, args[1])
        }

        options.direction = _.first([options.direction, args[0]].filter(function(d) {
            return (d === "IN" || d === "OUT")
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
    }
}