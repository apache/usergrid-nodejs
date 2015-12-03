'use strict'

var urljoin = require('url-join'),
    config = require('./config')

function buildUrl(options) {
    return urljoin(
        config.baseUrl,
        options.client.orgId,
        options.client.appId,
        options.type, (typeof options.uuidOrName === 'string') ? options.uuidOrName : ""
    )
}

module.exports = buildUrl