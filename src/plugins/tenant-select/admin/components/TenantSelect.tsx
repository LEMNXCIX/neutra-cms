import React, { useEffect, useState } from "react";
import { Combobox, ComboboxOption, Field } from "@strapi/design-system";
import { useFetchClient } from "@strapi/strapi/admin";

type Tenant = { id: string; name: string; slug?: string };

const TenantSelectInput = (props: any) => {
    const { name, onChange, value, required, error, hint, disabled } = props;
    const { get } = useFetchClient();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        get("/tenant-select/tenants")
            .then((res: any) => setTenants(res.data ?? []))
            .catch(() =>
                setFetchError(
                    "Could not load tenants. Set TENANTS_API_URL / TENANTS_API_TOKEN in the CMS env."
                )
            );
    }, [get]);

    return (
        <Field.Root
            name={name}
            label="Tenant"
            hint={hint ?? "Select the tenant this content belongs to"}
            required={required}
            error={error ?? fetchError ?? undefined}
        >
            <Combobox
                value={value ?? undefined}
                disabled={disabled}
                onChange={(v: string) =>
                    onChange({ target: { name, value: v, type: "string" } })
                }
            >
                {tenants.map((t) => (
                    <ComboboxOption value={t.id} key={t.id}>
                        {t.name}
                        {t.slug ? ` (${t.slug})` : ""}
                    </ComboboxOption>
                ))}
            </Combobox>
        </Field.Root>
    );
};

export default TenantSelectInput;
