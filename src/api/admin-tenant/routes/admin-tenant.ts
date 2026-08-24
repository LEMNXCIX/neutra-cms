import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::admin-tenant.admin-tenant", {
    config: {
        create: { policies: ["admin::isAdministrator"] },
        update: { policies: ["admin::isAdministrator"] },
        delete: { policies: ["admin::isAdministrator"] },
    },
});
