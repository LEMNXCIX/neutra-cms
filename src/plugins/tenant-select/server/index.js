const pluginId = "tenant-select";

// # ponytail: plugin server entries must be .js — Strapi's loadConfigFile
// ignores .ts (returns {}), so routes/custom fields silently never register.
let cachedToken = null;

async function getBackendJwt() {
    if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.jwt;

    const base = process.env.TENANTS_API_URL || "http://localhost:4000/api";
    const email = process.env.TENANTS_API_EMAIL;
    const password = process.env.TENANTS_API_PASSWORD;
    if (!email || !password) return null;

    const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const jwt = json.token ?? json.jwt ?? json.accessToken;
    if (!jwt) return null;

    cachedToken = { jwt, expires: Date.now() + 55 * 60 * 1000 };
    return jwt;
}

async function listTenants(ctx) {
    const base = process.env.TENANTS_API_URL || "http://localhost:4000/api";
    const staticToken = process.env.TENANTS_API_TOKEN;
    const jwt = staticToken ? null : await getBackendJwt();
    if (!staticToken && !jwt) {
        return ctx.internalServerError(
            "No backend credentials: set TENANTS_API_TOKEN or TENANTS_API_EMAIL/TENANTS_API_PASSWORD in the CMS env."
        );
    }

    try {
        const res = await fetch(`${base}/tenants`, {
            headers: staticToken
                ? { "x-api-token": staticToken }
                : { Authorization: `Bearer ${jwt}` },
        });
        if (!res.ok) {
            return ctx.internalServerError(
                `Backend tenants API responded ${res.status}`
            );
        }
        const json = await res.json();
        const list = Array.isArray(json)
            ? json
            : (json.data ?? json.tenants ?? []);
        ctx.body = list
            .filter((t) => t?.id && (t?.name || t?.slug))
            .map((t) => ({ id: t.id, name: t.name, slug: t.slug }));
    } catch (e) {
        ctx.internalServerError(`Failed to reach tenants API: ${e.message}`);
    }
}

module.exports = {
    register({ strapi }) {
        strapi.customFields.register({
            name: "tenant",
            plugin: pluginId,
            type: "string",
        });
    },
    controllers: { "tenant-select": { listTenants } },
    routes: {
        admin: {
            type: "admin",
            // useFetchClient in the admin panel prefixes calls with /admin
            prefix: "/admin/tenant-select",
            routes: [
                {
                    method: "GET",
                    path: "/tenants",
                    handler: "tenant-select.listTenants",
                },
            ],
        },
    },
};
