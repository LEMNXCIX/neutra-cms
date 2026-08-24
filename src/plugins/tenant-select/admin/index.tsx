const pluginId = "tenant-select";
import TenantSelectInput from "./components/TenantSelect";

export default {
    register(app: any) {
        app.customFields.register({
            name: "tenant",
            pluginId,
            type: "string",
            intlLabel: {
                id: "tenant-select.tenant.label",
                defaultMessage: "Tenant",
            },
            intlDescription: {
                id: "tenant-select.tenant.description",
                defaultMessage: "Pick a tenant from the list (stores the tenant id)",
            },
            components: {
                Input: () => import("./components/TenantSelect"),
            },
        });
    },
};
