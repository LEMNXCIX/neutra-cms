/**
 * Schema sanity tests — no Strapi runtime needed.
 * Catches the v5 schema format issues that only surfaced at boot:
 * missing collectionName, broken JSON, dangling component references,
 * tenant content types missing tenantId scoping.
 *
 * Run: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function readJson(path) {
    return JSON.parse(readFileSync(path, "utf8"));
}

function listContentTypes() {
    const apisDir = join(ROOT, "src", "api");
    const types = [];
    for (const api of readdirSync(apisDir)) {
        const ctDir = join(apisDir, api, "content-types");
        if (!existsSync(ctDir)) continue;
        for (const ct of readdirSync(ctDir)) {
            const schemaPath = join(ctDir, ct, "schema.json");
            if (existsSync(schemaPath)) {
                types.push({
                    uid: `api::${api}.${ct}`,
                    schema: readJson(schemaPath),
                });
            }
        }
    }
    return types;
}

function listComponents() {
    const compsDir = join(ROOT, "src", "components");
    const comps = [];
    if (!existsSync(compsDir)) return comps;
    for (const category of readdirSync(compsDir)) {
        const catPath = join(compsDir, category);
        if (!statSync(catPath).isDirectory()) continue;
        // v5 layout: src/components/{category}/{name}.json
        for (const file of readdirSync(catPath)) {
            if (file.endsWith(".json")) {
                comps.push({
                    uid: `${category}.${file.replace(/\.json$/, "")}`,
                    schema: readJson(join(catPath, file)),
                });
            }
        }
    }
    return comps;
}

const contentTypes = listContentTypes();
const components = listComponents();
const componentUids = new Set(components.map((c) => c.uid));

// Content types that hold per-tenant content (must have tenantId)
const TENANT_SCOPED = contentTypes
    .filter((c) => c.schema.attributes.tenantId)
    .map((c) => c.uid);

test("content types and components exist", () => {
    const uids = contentTypes.map((c) => c.uid);
    for (const expected of [
        "api::home-content.home-content",
        "api::admin-tenant.admin-tenant",
        "api::about-page.about-page",
        "api::faq-page.faq-page",
        "api::contact-page.contact-page",
        "api::privacy-page.privacy-page",
        "api::terms-page.terms-page",
        "api::careers-page.careers-page",
        "api::returns-page.returns-page",
        "api::shipping-page.shipping-page",
    ]) {
        assert.ok(uids.includes(expected), `missing content type: ${expected}`);
    }
    assert.ok(
        !uids.includes("api::banner.banner"),
        "banner was removed and must stay removed"
    );
    assert.ok(!uids.includes("api::page.page"), "page was removed and must stay removed");
    assert.ok(components.length >= 9, "expected at least 9 components");
});

test("every schema has required v5 fields", () => {
    for (const { uid, schema } of [...contentTypes, ...components]) {
        assert.ok(schema.info?.displayName, `${uid}: missing info.displayName`);
        assert.ok(schema.attributes, `${uid}: missing attributes`);
        assert.ok(
            schema.collectionName,
            `${uid}: missing collectionName (required in v5, fails at boot)`
        );
    }
});

test("tenant-scoped content types have a tenantId attribute", () => {
    assert.ok(TENANT_SCOPED.length >= 9, "expected at least 9 tenant-scoped types");
    for (const uid of TENANT_SCOPED) {
        const ct = contentTypes.find((c) => c.uid === uid);
        assert.equal(
            ct.schema.attributes.tenantId.type,
            "string",
            `${uid}: tenantId must be a string`
        );
    }
});

test("component references in attributes resolve", () => {
    const collect = (uid, attrs) => {
        for (const attr of Object.values(attrs)) {
            if (attr.type === "component") {
                assert.ok(
                    componentUids.has(attr.component),
                    `${uid}: dangling component reference: ${attr.component}`
                );
            }
            if (attr.type === "dynamiczone") {
                for (const c of attr.components ?? []) {
                    assert.ok(
                        componentUids.has(c),
                        `${uid}: dangling dynamic zone component: ${c}`
                    );
                }
            }
        }
    };
    for (const { uid, schema } of contentTypes) collect(uid, schema.attributes);
    for (const { uid, schema } of components) collect(uid, schema.attributes);
});

test("home-content has the fields the frontend consumes", () => {
    const home = contentTypes.find((c) => c.uid === "api::home-content.home-content");
    assert.ok(home, "home-content content type missing");
    for (const field of [
        "heroTitle",
        "heroHighlight",
        "heroSubtitle",
        "heroDescription",
        "heroCtaLabel",
        "heroCtaHref",
        "features",
        "ctaTitle",
        "ctaHighlight",
        "ctaSubtitle",
        "ctaDescription",
        "ctaPrimaryLabel",
        "ctaPrimaryHref",
        "ctaSecondaryLabel",
        "ctaSecondaryHref",
        "newsletterTitle",
        "newsletterSubtitle",
        "footerDescription",
        "socialLinks",
        "servicesBadge",
        "servicesTitle",
        "servicesSubtitle",
        "bookingHeroTitle",
        "bookingHeroHighlight",
        "bookingHeroSubtitle",
        "bookingCtaLabel",
        "bookingCtaHref",
    ]) {
        assert.ok(
            home.schema.attributes[field],
            `home-content: missing ${field} (frontend fallback expects it)`
        );
    }
});

test("page schemas have the fields the static pages consume", () => {
    const expectations = {
        "api::about-page.about-page": ["quote", "stats", "content"],
        "api::faq-page.faq-page": ["faqs"],
        "api::contact-page.contact-page": ["email", "phone", "address"],
        "api::privacy-page.privacy-page": ["content"],
        "api::terms-page.terms-page": ["content"],
        "api::careers-page.careers-page": ["jobs"],
        "api::returns-page.returns-page": ["steps", "policies"],
        "api::shipping-page.shipping-page": ["methods", "tiers"],
    };
    for (const [uid, fields] of Object.entries(expectations)) {
        const ct = contentTypes.find((c) => c.uid === uid);
        assert.ok(ct, `${uid} missing`);
        for (const field of ["badge", "title", "titleHighlight", "subtitle", ...fields]) {
            assert.ok(
                ct.schema.attributes[field],
                `${uid}: missing ${field}`
            );
        }
    }
});
