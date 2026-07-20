#!/usr/bin/env node
/**
 * Rebrand a fresh clone into a new idea's repo — the one-command entry
 * point behind `pnpm create-idea`. Run once, right after cloning:
 *
 *   pnpm create-idea --name my-idea
 *   pnpm create-idea --name my-idea --profile product
 *   pnpm create-idea --name my-idea --locales en --base en
 *
 * What it does (in place, on the current checkout):
 *   1. Strips product add-ons per --profile (delegates to strip-modules).
 *   2. Renames the package to <name>.
 *   3. Sets the locale defaults: prunes messages/, rewrites the inlang
 *      project locales and the Paraglide urlPatterns for the chosen set.
 *   4. Removes the boilerplate tooling (this script, strip-modules,
 *      modules.json) so the emitted repo is clean.
 *
 * After this, rebrand copy lives in messages/{locale}.json + structure in
 * src/site.config.ts (see NEW-IDEA.md). Nothing else needs editing.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i += 1;
      } else {
        args[key] = "true";
      }
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const name = args.name;
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.error(
    "usage: create-idea --name <kebab-name> [--profile validation|product] [--locales bg,en,el] [--base bg]"
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(root, "modules.json"), "utf8"));
const profile = args.profile ?? "validation";
if (!manifest.profiles[profile]) {
  console.error(
    `unknown profile "${profile}" (have: ${Object.keys(manifest.profiles).join(", ")})`
  );
  process.exit(1);
}

const locales = (args.locales ?? "bg,en,el").split(",").filter(Boolean);
const base = args.base ?? locales[0];
if (!locales.includes(base)) {
  console.error(`base locale "${base}" must be one of --locales (${locales.join(",")})`);
  process.exit(1);
}

// 1. Strip product add-ons for the profile (delegates; may self-remove).
console.log(`→ profile: ${profile}`);
execFileSync("node", [join(root, "tools", "strip-modules.mjs"), profile], {
  stdio: "inherit",
});

// 2. Rename the package.
const pkgPath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.name = name;
pkg.version = "0.0.0";
pkg.private = true;
if (pkg.scripts) {
  delete pkg.scripts["create-idea"];
}
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`→ package: ${name}`);

// 3a. Prune message files to the chosen locales.
const messagesDir = join(root, "messages");
for (const file of readdirSync(messagesDir)) {
  if (!file.endsWith(".json")) {
    continue;
  }
  const locale = file.replace(/\.json$/, "");
  if (!locales.includes(locale)) {
    rmSync(join(messagesDir, file));
    console.log(`→ drop locale: ${locale}`);
  }
}
// Seed any requested locale that doesn't exist yet from the base copy.
for (const locale of locales) {
  const path = join(messagesDir, `${locale}.json`);
  if (!existsSync(path)) {
    const seed = readFileSync(join(messagesDir, `${base}.json`), "utf8");
    writeFileSync(path, seed);
    console.log(`→ seed locale: ${locale} (from ${base}, translate it)`);
  }
}

// 3b. Rewrite the inlang project locales.
const inlangPath = join(root, "project.inlang", "settings.json");
const inlang = JSON.parse(readFileSync(inlangPath, "utf8"));
inlang.baseLocale = base;
inlang.locales = locales;
writeFileSync(inlangPath, `${JSON.stringify(inlang, null, 2)}\n`);

// 3c. Regenerate the Paraglide urlPatterns: base locale unprefixed ("/"),
// every other locale under "/<locale>". Order matters — non-base first,
// base (the catch-all) last.
const others = locales.filter((locale) => locale !== base);
const rootLocalized = [
  ...others.map((locale) => `            ["${locale}", "/${locale}"],`),
  `            ["${base}", "/"],`,
].join("\n");
const pathLocalized = [
  ...others.map(
    (locale) => `            ["${locale}", "/${locale}/:path(.*)?"],`
  ),
  `            ["${base}", "/:path(.*)?"],`,
].join("\n");
const urlPatterns = `urlPatterns: [
        {
          localized: [
${rootLocalized}
          ],
          pattern: "/",
        },
        {
          localized: [
${pathLocalized}
          ],
          pattern: "/:path(.*)?",
        },
      ],`;
const vitePath = join(root, "vite.config.ts");
const vite = readFileSync(vitePath, "utf8");
// Anchor the close on the 6-space-indented "]," — the outer array's,
// not the 10-space-indented inner localized arrays.
const patched = vite.replace(/urlPatterns: \[[\s\S]*?\n {6}\],/, urlPatterns);
if (patched === vite) {
  console.error("could not find urlPatterns block in vite.config.ts");
  process.exit(1);
}
writeFileSync(vitePath, patched);
console.log(`→ locales: ${locales.join(", ")} (base: ${base})`);

// 4. Remove the boilerplate tooling so the emitted repo is clean.
rmSync(join(root, "tools", "strip-modules.mjs"), { force: true });
rmSync(join(root, "modules.json"), { force: true });
rmSync(join(root, "tools", "create-idea.mjs"), { force: true });

console.log(`\n✓ "${name}" is ready.`);
console.log("next:");
console.log("  pnpm install");
console.log("  npx convex dev --once --configure=new --project " + name);
console.log("  pnpm lint:fix && pnpm build");
console.log("  # then rewrite copy in messages/*.json + structure in src/site.config.ts");
console.log("  # full checklist: NEW-IDEA.md");
