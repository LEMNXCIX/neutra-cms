import type { Core } from "@strapi/strapi";

/**
 * Row-level tenant scoping for tenant content types.
 *
 * Admin-panel users listed in the `admin-tenant` mapping (by email) can only
 * see/edit content of their tenant. Admins NOT in the mapping are superadmins
 * (full access). Content-API requests keep using the x-tenant-id header +
 * tenant-filter policy; this lifecycle only kicks in for admin users.
 *
 * # ponytail: email->tenant mapping table + db lifecycles instead of
 * extending admin::user; swap for a real plugin/extension if we outgrow it.
 */

const TENANT_MODELS = [
    "api::banner.banner",
    "api::home-content.home-content",
    "api::page.page",
];

const CACHE_TTL_MS = 60_000;
const tenantByEmail = new Map<string, { tenantId: string; expires: number }>();

async function tenantIdForEmail(
    strapi: Core.Strapi,
    email: string
): Promise<string | null> {
    const cached = tenantByEmail.get(email);
    if (cached && cached.expires > Date.now()) return cached.tenantId;

    const entry = await strapi
        .documents("api::admin-tenant.admin-tenant")
        .findFirst({ filters: { email: { $eqi: email } } });
    if (!entry) return null;

    tenantByEmail.set(email, {
        tenantId: entry.tenantId,
        expires: Date.now() + CACHE_TTL_MS,
    });
    return entry.tenantId;
}

function adminTenantId(strapi: Core.Strapi): Promise<string | null> | null {
    const ctx = strapi.requestContext.get();
    const user = ctx?.state?.user;
    // Admin users carry a `roles` array; users-permissions users don't.
    if (!user || !Array.isArray(user.roles)) return null;
    return tenantIdForEmail(strapi, user.email);
}

function scopeWhere(params: any, tenantId: string) {
    params.where = {
        $and: [...(params.where ? [params.where] : []), { tenantId }],
    };
}

export default {
    async register({ strapi }: { strapi: Core.Strapi }) {
        strapi.db.lifecycles.subscribe({
            models: TENANT_MODELS,
            async beforeFindMany(event) {
                const tenantId = await adminTenantId(strapi);
                if (tenantId) scopeWhere(event.params, tenantId);
            },
            async beforeFindOne(event) {
                const tenantId = await adminTenantId(strapi);
                if (tenantId) scopeWhere(event.params, tenantId);
            },
            async beforeCount(event) {
                const tenantId = await adminTenantId(strapi);
                if (tenantId) scopeWhere(event.params, tenantId);
            },
            async beforeCreate(event) {
                const tenantId = await adminTenantId(strapi);
                if (tenantId) event.params.data.tenantId = tenantId;
            },
            async beforeUpdate(event) {
                const tenantId = await adminTenantId(strapi);
                if (tenantId) {
                    scopeWhere(event.params, tenantId);
                    delete event.params.data.tenantId;
                }
            },
            async beforeDelete(event) {
                const tenantId = await adminTenantId(strapi);
                if (tenantId) scopeWhere(event.params, tenantId);
            },
        });
    },
};
