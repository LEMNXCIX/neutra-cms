export default (policyContext: any, _config: unknown, { strapi }: any) => {
    const { tenantId } = policyContext.state;

    if (!tenantId) {
        strapi.log.warn("Accessing content without tenant context");
        return true;
    }

    if (!policyContext.query.filters) {
        policyContext.query.filters = {};
    }
    policyContext.query.filters.tenantId = tenantId;

    if (policyContext.request.body?.data) {
        policyContext.request.body.data.tenantId = tenantId;
    }

    return true;
};
