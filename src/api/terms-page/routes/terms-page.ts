import { factories } from "@strapi/strapi";

const tenantScoped = {
    policies: ["global::tenant-filter"],
    middlewares: ["global::tenant-context"],
};

export default factories.createCoreRouter("api::terms-page.terms-page", {
    config: {
        find: tenantScoped,
        findOne: tenantScoped,
        create: tenantScoped,
        update: tenantScoped,
        delete: tenantScoped,
    },
});
