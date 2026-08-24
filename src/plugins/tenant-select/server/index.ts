import type { Core } from "@strapi/strapi";
import pluginId from "../pluginId";

const listTenants = async (ctx: any) => {
    const base = process.env.TENANTS_API_URL || "http://localhost:4000/api";
    const token = process.env.TENANTS_API_TOKEN;
    try {
        const res = await fetch(`${base}/tenants`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
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
