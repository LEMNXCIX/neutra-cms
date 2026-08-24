import { factories } from "@strapi/strapi";

// No public permissions are granted for this content type, so the content
// API rejects anonymous requests by default. Admin-panel access is scoped
// by the lifecycles in src/index.ts.
export default factories.createCoreRouter("api::admin-tenant.admin-tenant");
