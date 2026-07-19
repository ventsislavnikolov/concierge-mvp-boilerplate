#!/usr/bin/env node
/**
 * Strip product add-ons from a clone, per modules.json.
 *
 *   node tools/strip-modules.mjs <profile>          # e.g. validation
 *   node tools/strip-modules.mjs --modules auth,…   # explicit keep-list
 *
 * For every module NOT kept: deletes its files, removes its marker
 * blocks/lines from seam files, drops its npm deps and its message-key
 * prefixes from all locale files. Refuses keep-lists that break
 * dependsOn. Intended to run once, right after cloning (see #20).
 */
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "modules.json"), "utf8"));

const arg = process.argv[2];
if (!arg) {
  console.error("usage: strip-modules.mjs <profile> | --modules a,b,c");
  process.exit(1);
}
let keep;
if (arg === "--modules") {
  keep = new Set((process.argv[3] ?? "").split(",").filter(Boolean));
} else {
  const profile = manifest.profiles[arg];
  if (!profile) {
    console.error(
      `unknown profile "${arg}" (have: ${Object.keys(manifest.profiles).join(", ")})`
    );
    process.exit(1);
  }
  keep = new Set(profile);
}

for (const name of keep) {
  const mod = manifest.modules[name];
  if (!mod) {
    console.error(`unknown module "${name}"`);
    process.exit(1);
  }
  for (const dep of mod.dependsOn) {
    if (!keep.has(dep)) {
      console.error(`module "${name}" requires "${dep}" — keep both`);
      process.exit(1);
    }
  }
}

const strip = Object.keys(manifest.modules).filter((m) => !keep.has(m));
if (strip.length === 0) {
  console.log("nothing to strip");
  process.exit(0);
}

const isStartMarker = (line, name) =>
  [`// module:${name}`, `{/* module:${name} */}`, `/* module:${name} */`].includes(
    line.trim()
  );
const isEndMarker = (line, name) =>
  [
    `// end-module:${name}`,
    `{/* end-module:${name} */}`,
    `/* end-module:${name} */`,
  ].includes(line.trim());
const hasInlineMarker = (line, name) =>
  line.includes(`// module:${name}`) || line.includes(`/* module:${name} */`);

function stripSeams(path, name) {
  const lines = readFileSync(path, "utf8").split("\n");
  const out = [];
  let skipping = false;
  let touched = false;
  for (const line of lines) {
    if (skipping) {
      touched = true;
      if (isEndMarker(line, name)) {
        skipping = false;
      }
      continue;
    }
    if (isStartMarker(line, name)) {
      skipping = true;
      touched = true;
      continue;
    }
    if (hasInlineMarker(line, name)) {
      touched = true;
      continue;
    }
    out.push(line);
  }
  if (skipping) {
    throw new Error(`${path}: unterminated module:${name} block`);
  }
  if (touched) {
    writeFileSync(path, out.join("\n"));
  }
  return touched;
}

const pkgPath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

for (const name of strip) {
  const mod = manifest.modules[name];
  for (const file of mod.files) {
    rmSync(join(root, file), { force: true, recursive: true });
    console.log(`rm    ${file}`);
  }
  for (const seam of mod.seams) {
    const path = join(root, seam);
    try {
      if (stripSeams(path, name)) {
        console.log(`seam  ${seam} (-${name})`);
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      // seam file already deleted by another stripped module
    }
  }
  for (const dep of mod.deps) {
    if (pkg.dependencies?.[dep]) {
      delete pkg.dependencies[dep];
      console.log(`dep   ${dep}`);
    }
  }
  for (const prefix of mod.messagePrefixes) {
    for (const locale of ["bg", "en", "el"]) {
      const msgPath = join(root, "messages", `${locale}.json`);
      const messages = JSON.parse(readFileSync(msgPath, "utf8"));
      let removed = 0;
      for (const key of Object.keys(messages)) {
        if (key.startsWith(prefix)) {
          delete messages[key];
          removed += 1;
        }
      }
      if (removed > 0) {
        writeFileSync(msgPath, `${JSON.stringify(messages, null, 2)}\n`);
      }
    }
    console.log(`msgs  ${prefix}*`);
  }
}

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
rmSync(join(root, "tools", "strip-modules.mjs"), { force: true });
rmSync(join(root, "modules.json"), { force: true });
console.log(`stripped: ${strip.join(", ")} — kept: ${[...keep].join(", ") || "core only"}`);
console.log(
  "next: pnpm install && npx convex codegen && pnpm lint:fix && pnpm build"
);
