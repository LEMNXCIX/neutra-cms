import type { Core } from "@strapi/strapi";

/**
 * Reads the `x-tenant-id` header and stores it in Koa state so the
 * `tenant-filter` policy can scope queries to the requesting tenant.
 */
export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: any, next: () => Promise<void>) => {
        const tenantId = ctx.request.header["x-tenant-id"];
        if (tenantId) {
            ctx.state.tenantId = tenantId;
        }
        await next();
    };
};
