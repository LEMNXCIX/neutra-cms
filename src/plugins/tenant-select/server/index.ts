import type { Core } from "@strapi/strapi";
import pluginId from "../pluginId";

// # ponytail: JWT cached in memory per isolate, re-logged on 401; swap for a
// long-lived service token (TENANTS_API_TOKEN) if the backend issues them.
let cachedToken: { jwt: string; expires: number } | null = null;

async function getBackendJwt(): Promise<string | null> {
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
    const json: any = await res.json();
    const jwt = json.token ?? json.jwt ?? json.accessToken;
    if (!jwt) return null;

    cachedToken = { jwt, expires: Date.now() + 55 * 60 * 1000 };
    return jwt;
}

const listTenants = async (ctx: any) => {
    const base = process.env.TENANTS_API_URL || "http://localhost:4000/api";
    const staticToken = process.env.TENANTS_API_TOKEN;
    const jwt = staticToken || (await getBackendJwt());
    if (!jwt) {
        return ctx.internalServerError(
            "No backend credentials: set TENANTS_API_TOKEN or TENANTS_API_EMAIL/TENANTS_API_PASSWORD in the CMS env."
        );
    }

    try {
        const res = await fetch(`${base}/tenants`, {
            headers:
                staticToken
                    ? { "x-api-token": staticToken }
                    : { Authorization: `Bearer ${jwt}` },
        });
        if (res.status === 401 && !staticToken) {
            cachedToken = null; // expired, re-login on next call
            return ctx.internalServerError("Backend session expired, retry.");
        }
        if (!res.ok) {
            return ctx.internalServerError(
                `Backend tenants API responded ${res.status}`
            );
        }
        const json: any = await res.json();
        const list = Array.isArray(json)
            ? json
            : (json.data ?? json.tenants ?? []);
        ctx.body = list
            .filter((t: any) => t?.id && (t?.name || t?.slug))
            .map((t: any) => ({ id: t.id, name: t.name, slug: t.slug }));
    } catch (e: any) {
        ctx.internalServerError(`Failed to reach tenants API: ${e.message}`);
    }
};

export default {
    register({ strapi }: { strapi: Core.Strapi }) {
        strapi.customFields.register({
            name: "tenant",
            plugin: pluginId,
            type: "string",
        });
    },
    controllers: { "tenant-select": { listTenants } },
    routes: [
        {
            method: "GET",
            path: "/tenants",
            handler: "tenant-select.listTenants",
            info: { type: "admin", description: "List tenants for the selector" },
        },
    ],
};
