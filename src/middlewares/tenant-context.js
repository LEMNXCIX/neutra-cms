'use strict';

/**
 * `tenant-context` middleware
 */

module.exports = (config, { strapi }) => {
    return async (ctx, next) => {
        const tenantId = ctx.request.header['x-tenant-id'];

        if (tenantId) {
            ctx.state.tenantId = tenantId;
        }

        await next();
    };
};
