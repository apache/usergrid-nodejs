'use strict'

var urljoin = require('url-join'),
    ok = require('objectkit'),
    config = require('../config.json')

function buildUrl(options) {
    return urljoin(
        ok(config).getIfExists('usergrid.baseUrl'),
        options.client.orgId,
        options.client.appId,
        options.type, (typeof options.uuidOrName === 'string') ? options.uuidOrName : ""
    )
}

module.exports = buildUrl