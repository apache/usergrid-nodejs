'use strict'

var urljoin = require('url-join'),
    ok = require('objectkit'),
    config = require('../config.json')

function buildUrl(opts) {
    return urljoin(
        ok(config).getIfExists('usergrid.baseUrl'),
        opts.client.orgId,
        opts.client.appId,
        opts.type, (typeof opts.uuidOrName === 'string') ? opts.uuidOrName : ""
    )
}

module.exports = buildUrl