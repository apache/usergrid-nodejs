'use strict'

var urljoin = require('url-join'),
    config = require('./config'),
    helpers = require('./'),
    UsergridQuery = require('../lib/query'),
    UsergridEntity = require('../lib/entity'),
    ok = require('objectkit'),
    _ = require('lodash')

module.exports = {
    url: function(options) {
        return urljoin(
            config.baseUrl,
            options.client.orgId,
            options.client.appId,
            options.type, (_.isString(options.uuidOrName) ? options.uuidOrName : "")
        )
    },
    GET: function(client, args) {

        /* GET supports the following constructor patterns:

        client.GET('type', 'uuidOrName', optionalCallback)
        client.GET('type', optionalCallback)
        client.GET(query, optionalCallback)
        client.GET({
            query: query, // takes precedence
            type: type, // required only if query not defined
            uuid: uuid, // will be set to nameOrUuid on init (priority)
            name: name, // will be set to nameOrUuid on init (if no uuid specified)
            nameOrUuid: nameOrUuid // the definitive key for name or uuid
        }, optionalCallback)

        */

        var options = {
            client: client,
            method: 'GET'
        }

        if (_.isObject(args[0]) && !_.isFunction(args[0]) && !(args[0] instanceof UsergridQuery)) {
            _.assign(options, args[0])
        }

        options.callback = helpers.cb(_.last(args.filter(_.isFunction)))

        options.type = _.first([options.type, args[0]._type, args[0]].filter(_.isString))

        options.query = _.first([options.query, args[0]].filter(function(property) {
            return (property instanceof UsergridQuery)
        }))
        options.uuidOrName = _.last([options.uuidOrName, options.uuid, options.name, args[1]].filter(function(property) {
            return (property)
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
            type: type, // required only if query not defined
            body: bodyObject or bodyObjectOrEntity, // if includes type, type will be inferred from body
            *uuid, name* = alias to nameOrUuid*
            nameOrUuid: nameOrUuid // the definitive key for name or uuid
        }, optionalCallback)

        */

        var options = {
            client: client,
            method: 'PUT'
        }

        if (_.isObject(args[0]) && !_.isFunction(args[0]) && !(args[0] instanceof UsergridEntity) && !(args[0] instanceof UsergridQuery)) {
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

        return options
    },

    POST: function(client, args) {

        /* POST supports the following constructor patterns:

        client.POST('type', bodyObjectOrArray, optionalCallback)
        client.POST(bodyObjectOrArray, optionalCallback) // must include type in body
        client.POST(entityOrEntities, optionalCallback)
        client.POST({
            *entity, entities = alias to body*
            type: type, // required if type is not inferred
            body: bodyObjectOrArray or entityOrEntities, // if the first entity includes type, type will be inferred from body
        }, optionalCallback)

        */

        var options = {
            client: client,
            method: 'POST'
        }

        if (_.isObject(args[0]) && !_.isFunction(args[0]) && !(args[0] instanceof UsergridEntity)) {
            _.assign(options, args[0])
        }

        options.callback = helpers.cb(_.last(args.filter(_.isFunction)))    

        options.body = _.first([options.entities, options.entity, options.body, args[1], args[0]].filter(function(property) {
            return _.isArray(property) && _.isObject(property[0]) && !_.isFunction(property[0]) || _.isObject(property) && !_.isFunction(property)
        }))
        
        if (typeof options.body !== 'object') {
            throw new Error('"body" parameter is required when making a POST request')
        }

        options.body = _.isArray(options.body) ? options.body : [options.body]        
        options.type = _.first([options.type, args[0], options.body[0].type].filter(_.isString))

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
            type: type, // required if type is not inferred
            query: query // takes precedence over type/uuid
        }, optionalCallback)

        */

        var options = {
            client: client,
            method: 'DELETE'
        }

        if (_.isObject(args[0]) && !_.isFunction(args[0]) && !(args[0] instanceof UsergridQuery)) {
            _.assign(options, args[0])
        }

        options.callback = helpers.cb(_.last(args.filter(_.isFunction)))

        options.type = _.first([options.type, args[0]._type, args[0]].filter(_.isString))
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
    }
}