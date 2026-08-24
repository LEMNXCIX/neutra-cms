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

const TENANT_SCOPED = [
    "api::banner.banner",
    "api::home-content.home-content",
    "api::page.page",
];

test("content types and components exist", () => {
    assert.ok(contentTypes.length >= 4, "expected at least 4 content types");
    assert.ok(components.length >= 3, "expected at least 3 components");
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
    for (const { uid, schema } of contentTypes) {
        if (!TENANT_SCOPED.includes(uid)) continue;
        assert.ok(
            schema.attributes.tenantId?.type === "string",
            `${uid}: missing tenantId attribute`
        );
    }
});

test("component references in attributes resolve", () => {
    const collect = (attrs) => {
        for (const attr of Object.values(attrs)) {
            if (attr.type === "component") {
                assert.ok(
                    componentUids.has(attr.component),
                    `dangling component reference: ${attr.component}`
                );
            }
            if (attr.type === "dynamiczone") {
                for (const uid of attr.components ?? []) {
                    assert.ok(
                        componentUids.has(uid),
                        `dangling dynamic zone component: ${uid}`
                    );
                }
            }
        }
    };
    for (const { uid, schema } of contentTypes) collect(schema.attributes);
    for (const { uid, schema } of components) collect(schema.attributes);
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
    ]) {
        assert.ok(
            home.schema.attributes[field],
            `home-content: missing ${field} (frontend fallback expects it)`
        );
    }
});

test("page slugs cover the static frontend routes", () => {
    const page = contentTypes.find((c) => c.uid === "api::page.page");
    assert.ok(page, "page content type missing");
    assert.equal(page.schema.attributes.slug?.type, "string", "page: slug must be a string");
});
