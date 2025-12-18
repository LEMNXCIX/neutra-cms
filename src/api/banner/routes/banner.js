'use strict';

/**
 * banner router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::banner.banner', {
    config: {
        find: {
            policies: ['global::tenant-filter'],
            middlewares: ['global::tenant-context'],
        },
        findOne: {
            policies: ['global::tenant-filter'],
            middlewares: ['global::tenant-context'],
        },
        create: {
            policies: ['global::tenant-filter'],
            middlewares: ['global::tenant-context'],
        },
        update: {
            policies: ['global::tenant-filter'],
            middlewares: ['global::tenant-context'],
        },
        delete: {
            policies: ['global::tenant-filter'],
            middlewares: ['global::tenant-context'],
        },
    }
});
