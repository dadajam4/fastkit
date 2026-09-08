// Consumer-facing phantom dependency audit.
//
// Scans every published package's built `dist` for import specifiers that are
// NOT declared in its own dependencies / peerDependencies / optionalDependencies.
// Consumers do not receive devDependencies, and bundled imports never appear in
// `dist` — so an undeclared `dist` import is exactly what breaks a consumer who
// does NOT enable `shamefully-hoist`. See docs/dependency-management.md.
//
// It also detects the inverse leak: an undeclared external package whose types
// are INLINED into a published `.d.ts` (no import specifier to catch). See the
// REGION_RE block below.
//
// Packages that publish their source as-is instead of a `dist` build (the
// `@fastkit/*-config` lint configs, `ts-type-utils`, `stylebase`) get a second,
// source-based pass — see the "source-shipped" section below. Their published
// files reference modules two ways: real `import`s, and plain STRINGS that the
// lint runner resolves at load time (`extends`, `plugins`, `customSyntax`, ...).
// Those strings are invisible to any import scan, and a missing declaration
// there breaks the consumer just as hard: an undeclared `extends` entry made
// `@fastkit/stylelint-config` fail to load for every consumer (issue #186)
// while this repository stayed green, because the same package sits in the root
// devDependencies here.
//
// Severity:
//   - static runtime import (`import … from` / `require`) -> HARD runtime break
//   - type import in `.d.ts`                              -> breaks consumer typecheck
//   - inlined external type in `.d.ts`                    -> bloat + hidden type dep (approach A)
//   - via declared dep (informational)                   -> undeclared, but genuinely
//        provided through a REQUIRED declared dep (its dep/peer). Resolves wherever
//        this package is usable; reported for visibility, not failed. Used e.g. when a
//        `.d.ts` references types that arrive via a required peer (see the neverBundle
//        note in docs/dependency-management.md).
//   - dynamic `import()`                                  -> usually optional / guarded
//
// Exit 1 if any static-runtime, type, or inlined-external-type phantom is found.
// `[via]` and `[dynamic]` are reported for review but do not fail (dynamic imports
// are typically try/catch-guarded optional features — declaring them would
// force-install the module for every consumer; see docs/dependency-management.md).
//
// Requires the workspace to be built first (`pnpm build`) — it reads `dist`.
//
// NOTE: this scans import *specifiers*, so it cannot see ambient `@types/*`
// (pulled in implicitly, never referenced by name). If a published `.d.ts`
// exposes a type from `@types/X`, verify that separately — see the "@types
// blind spot" note in docs/dependency-management.md.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkgsBase = join(ROOT, 'packages');

const STATIC_RES = [
  /\bfrom\s*['"]([^'"\n]+)['"]/g,
  /\brequire\(\s*['"]([^'"\n]+)['"]\s*\)/g,
  /^\s*import\s+['"]([^'"\n]+)['"]/gm,
];
const DYNAMIC_RE = /\bimport\(\s*['"]([^'"\n]+)['"]\s*\)/g;
// Inlined external type regions. rolldown-plugin-dts INLINES a package's `.d.ts`
// content into ours (as `//#region <path>` blocks) when that package is NOT
// externalized — i.e. NOT declared in dependencies / peerDependencies /
// optionalDependencies. Declaring it flips the inline into a plain
// `import('pkg')` reference (the standard, self-describing output). An inlined
// undeclared external type is not a hard consumer break (the `.d.ts` is
// self-contained), but it bloats the output, can go stale, and hides a real
// type dependency — so we fail on it to keep every package self-describing.
// See docs/dependency-management.md ("inlined external types").
// NOTE: matched on RAW text — `//#region` is a comment and would be stripped.
const REGION_RE =
  /^\s*\/\/#region\s+.*\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*)\//gm;
// Workspace-internal inline: a sibling package inlined via a relative path,
// e.g. `//#region ../vue-form-control/dist/vue-form-control.d.mts`. Captures the
// sibling DIRECTORY name (translated to an npm name via `dirToName`). The path
// must NOT contain `/node_modules/` (that's REGION_RE's job).
const WS_REGION_RE =
  /^\s*\/\/#region\s+((?:\.\.\/)+)([a-z0-9-~][a-z0-9-._~]*)\/(?:dist|types|src)\//gm;

const PKG = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const BUILTIN = new Set([
  'fs', 'path', 'os', 'util', 'crypto', 'stream', 'events', 'http', 'https',
  'url', 'zlib', 'child_process', 'module', 'assert', 'buffer', 'process', 'tty',
  'net', 'readline', 'string_decoder', 'querystring', 'vm', 'worker_threads',
  'perf_hooks', 'timers', 'dns', 'fs/promises',
]);

function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}
function collect(re, code, set) {
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(code))) if (m[1]) set.add(m[1]);
}
function toPkg(spec) {
  if (spec.startsWith('node:') || spec.startsWith('.') || spec.startsWith('/')) return null;
  const parts = spec.split('/');
  const name = spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
  if (!PKG.test(name) || BUILTIN.has(name)) return null;
  return name;
}
function* walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const RT = /\.(mjs|cjs|js)$/;
const DT = /\.d\.(m|c)?ts$/;

const rows = [];
let nStatic = 0, nDynamic = 0, nType = 0, nInline = 0, nVia = 0, scanned = 0, publishable = 0;
const skipped = [], nonDist = [], configLoadFailures = [];

// What each workspace package *provides* to whoever depends on it: its own
// `dependencies` (auto-installed with it) plus `peerDependencies` (which the
// consumer must supply to use it). So if package P declares a REQUIRED dep D,
// then everything in `wsProvides[D]` is guaranteed present wherever P is usable.
// This lets an undeclared reference that is genuinely provided *through* a
// declared dependency be recognised (`[via]`) instead of flagged as a phantom —
// e.g. `@fastkit/vui-wysiwyg` references `@fastkit/vue-form-control` types that
// arrive via its required `@fastkit/vui` peer (which depends on them). See
// docs/dependency-management.md ("references provided through a declared dep").
const wsProvides = new Map();
// Map a package *directory* basename -> its npm name. Inlined workspace types
// appear as `//#region ../<dir>/dist/….d.ts` (a relative path using the sibling
// DIRECTORY name), so we translate the dir back to the npm name to check it.
const dirToName = new Map();
for (const name of readdirSync(pkgsBase)) {
  const pj = join(pkgsBase, name, 'package.json');
  if (!existsSync(pj)) continue;
  const p = JSON.parse(readFileSync(pj, 'utf8'));
  wsProvides.set(p.name, new Set([
    ...Object.keys(p.dependencies || {}),
    ...Object.keys(p.peerDependencies || {}),
  ]));
  dirToName.set(name, p.name);
}

// Does the package ship its published output from `dist/`? (vs config/type
// packages that publish source files directly, e.g. `index.mjs`, `types/`.)
const expectsDist = (pkg) => {
  const fields = [pkg.main, pkg.module, pkg.types, pkg.typings].filter(Boolean);
  if (fields.some((f) => /(^|\/)dist\//.test(f))) return true;
  if (Array.isArray(pkg.files) && pkg.files.some((f) => /(^|\/)dist(\/|$)/.test(f))) return true;
  return pkg.exports ? JSON.stringify(pkg.exports).includes('/dist') : false;
};

for (const name of readdirSync(pkgsBase)) {
  const dir = join(pkgsBase, name);
  const pj = join(dir, 'package.json');
  if (!existsSync(pj)) continue;
  const pkg = JSON.parse(readFileSync(pj, 'utf8'));
  if (pkg.private) continue;
  publishable += 1;
  const dist = join(dir, 'dist');
  if (!existsSync(dist)) {
    // Ships from dist but has none -> not built (real problem, warn).
    // Doesn't ship from dist -> source-shipped; audited by the second pass.
    if (expectsDist(pkg)) skipped.push(pkg.name);
    else nonDist.push({ name: pkg.name, dir, pkg });
    continue;
  }
  scanned += 1;
  const declared = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
  ]);
  const self = pkg.name;
  // What is guaranteed present through this package's REQUIRED declared deps
  // (dependencies + non-optional peerDependencies). Maps provided-pkg -> the
  // declared dep that provides it. Optional peers do NOT guarantee provision.
  const optionalPeers = new Set(
    Object.entries(pkg.peerDependenciesMeta || {})
      .filter(([, m]) => m && m.optional)
      .map(([k]) => k),
  );
  const requiredDeclared = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}).filter((d) => !optionalPeers.has(d)),
  ];
  const providedVia = new Map();
  for (const d of requiredDeclared) {
    const provided = wsProvides.get(d);
    if (!provided) continue;
    for (const x of provided) if (!providedVia.has(x)) providedVia.set(x, d);
  }
  const stat = new Map(), dyn = new Map(), typ = new Map(), inl = new Map(), via = new Map();
  for (const f of walk(dist)) {
    const isRT = RT.test(f), isDT = DT.test(f);
    if (!isRT && !isDT) continue;
    let raw;
    try { raw = readFileSync(f, 'utf8'); } catch { continue; }
    const code = stripComments(raw);
    const staticSpecs = new Set(), dynSpecs = new Set();
    for (const re of STATIC_RES) collect(re, code, staticSpecs);
    collect(DYNAMIC_RE, code, dynSpecs);
    const add = (specs, bucket) => {
      for (const s of specs) {
        const dep = toPkg(s);
        if (!dep || dep === self || declared.has(dep)) continue;
        if (providedVia.has(dep)) {
          // Undeclared, but provided through a required declared dep -> acceptable.
          if (!via.has(dep)) via.set(dep, { by: providedVia.get(dep), files: new Set() });
          via.get(dep).files.add(relative(dir, f));
        } else {
          if (!bucket.has(dep)) bucket.set(dep, new Set());
          bucket.get(dep).add(relative(dir, f));
        }
      }
    };
    if (isDT) {
      add(new Set([...staticSpecs, ...dynSpecs]), typ);
      // Inlined external type regions — scanned on RAW text (see REGION_RE).
      // An inline is a baked-in COPY, so provision-via-a-dep does NOT make it
      // acceptable (it still bloats + risks a nominal type-identity clash);
      // always flag it so the fix (neverBundle / declare) is applied.
      const flagInline = (dep) => {
        if (!dep || dep === self || declared.has(dep)) return;
        if (!inl.has(dep)) inl.set(dep, new Set());
        inl.get(dep).add(relative(dir, f));
      };
      REGION_RE.lastIndex = 0;
      let m;
      while ((m = REGION_RE.exec(raw))) flagInline(m[1]);
      // Workspace-internal inline (sibling package via relative path).
      WS_REGION_RE.lastIndex = 0;
      let w;
      while ((w = WS_REGION_RE.exec(raw))) flagInline(dirToName.get(w[2]));
    } else { add(staticSpecs, stat); add(dynSpecs, dyn); }
  }
  if (stat.size || dyn.size || typ.size || inl.size || via.size) {
    rows.push([self, stat, dyn, typ, inl, via]);
    nStatic += stat.size;
    nDynamic += dyn.size;
    nType += typ.size;
    nInline += inl.size;
    nVia += via.size;
  }
}

// ---------------------------------------------------------------------------
// Source-shipped packages (no `dist`: the published files ARE the source).
//
// Two kinds of reference are checked against the package's own declarations:
//   - `import` / `require` specifiers, exactly as in the dist pass
//   - module names given as STRINGS in a config the runner resolves at load
//     time (`extends`, `plugins`, `customSyntax`, `parser`, `processor`)
//
// The strings are read from the loaded module rather than matched in the text,
// so a name assembled or nested (a stylelint `overrides[].customSyntax`) is
// still seen. A string is only reported when the package it names is actually
// present in this workspace's `node_modules` tree: that is what tells a real
// module reference apart from a plugin-namespaced rule name, and it is exactly
// the situation that hides the bug here (resolvable via the root, undeclared by
// the package, missing for the consumer).
// Cheap gate on the file text: does any module-ref key have a STRING literal
// value here? Only then is the module loaded. It keeps the load out of
// plugin-laden configs that reference everything by import (an eslint flat
// config's `plugins` / `parser` hold imported objects — importing
// `@fastkit/eslint-config` alone costs ~0.5s, and its specifiers are already
// covered by the import scan above). A name assembled at runtime rather than
// written as a literal is therefore not seen; no config here has one.
const CONFIG_REF_LITERAL =
  /\b(?:extends|plugins|customSyntax|parser|processors?)\s*:\s*(?:\[\s*)?['"`]/;

const CONFIG_REF_KEYS = new Set([
  'extends',
  'plugins',
  'customSyntax',
  'parser',
  'processor',
  'processors',
]);

// Collect the module-name strings from a loaded config. Values under a
// CONFIG_REF_KEY are taken as names (string, or array of strings) and never
// descended into — an eslint flat config's `plugins` holds the imported plugin
// OBJECTS, whose rule metadata is large and self-referential.
function collectConfigRefs(node, out, depth = 0, seen = new Set()) {
  if (!node || typeof node !== 'object' || depth > 6 || seen.has(node)) return;
  seen.add(node);
  if (Array.isArray(node)) {
    for (const v of node) collectConfigRefs(v, out, depth + 1, seen);
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (CONFIG_REF_KEYS.has(k)) {
      if (typeof v === 'string') out.add(v);
      else if (Array.isArray(v)) for (const x of v) if (typeof x === 'string') out.add(x);
      continue;
    }
    // stylelint nests full configs under `overrides`.
    if (k === 'overrides') collectConfigRefs(v, out, depth + 1, seen);
  }
}

// The package's published file set, from `files` (a name, or a directory to walk).
function publishedFiles(dir, pkg) {
  const out = [];
  for (const entry of Array.isArray(pkg.files) ? pkg.files : []) {
    if (/[*?[\]{}]/.test(entry)) {
      globbedFiles.add(pkg.name);
      continue;
    }
    const p = join(dir, entry);
    if (!existsSync(p)) continue;
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// Is `name` installed anywhere in the tree above `fromDir`?
function inNodeModulesTree(fromDir, name) {
  let d = fromDir;
  for (;;) {
    if (existsSync(join(d, 'node_modules', name, 'package.json'))) return true;
    const up = dirname(d);
    if (up === d || !d.startsWith(ROOT)) return false;
    d = up;
  }
}

const globbedFiles = new Set();
const srcRows = [];
let nSrcStatic = 0, nSrcType = 0, nSrcConfig = 0, nSrcDynamic = 0, nSrcVia = 0;

for (const { name: self, dir, pkg } of nonDist) {
  const declared = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
  ]);
  const optionalPeers = new Set(
    Object.entries(pkg.peerDependenciesMeta || {})
      .filter(([, m]) => m && m.optional)
      .map(([k]) => k),
  );
  const providedVia = new Map();
  for (const d of [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}).filter((d) => !optionalPeers.has(d)),
  ]) {
    for (const x of wsProvides.get(d) || []) if (!providedVia.has(x)) providedVia.set(x, d);
  }

  const stat = new Map(), dyn = new Map(), typ = new Map(), cfg = new Map(), via = new Map();
  const add = (bucket, dep, file) => {
    if (!dep || dep === self || declared.has(dep)) return;
    if (providedVia.has(dep)) {
      if (!via.has(dep)) via.set(dep, { by: providedVia.get(dep), files: new Set() });
      via.get(dep).files.add(file);
      return;
    }
    if (!bucket.has(dep)) bucket.set(dep, new Set());
    bucket.get(dep).add(file);
  };

  for (const f of publishedFiles(dir, pkg)) {
    const rel = relative(dir, f);
    const isRT = RT.test(f), isDT = DT.test(f);
    if (!isRT && !isDT) continue;
    let code;
    try { code = stripComments(readFileSync(f, 'utf8')); } catch { continue; }
    const staticSpecs = new Set(), dynSpecs = new Set();
    for (const re of STATIC_RES) collect(re, code, staticSpecs);
    collect(DYNAMIC_RE, code, dynSpecs);
    if (isDT) {
      for (const spec of [...staticSpecs, ...dynSpecs]) add(typ, toPkg(spec), rel);
      continue;
    }
    for (const spec of staticSpecs) add(stat, toPkg(spec), rel);
    for (const spec of dynSpecs) add(dyn, toPkg(spec), rel);

    if (!CONFIG_REF_LITERAL.test(code)) continue;
    let mod;
    try {
      mod = await import(pathToFileURL(f).href);
    } catch (err) {
      configLoadFailures.push(`${self} (${rel}): ${err.message.split('\n')[0]}`);
      continue;
    }
    const refs = new Set();
    collectConfigRefs(mod.default ?? mod, refs);
    for (const spec of refs) {
      const dep = toPkg(spec);
      if (!dep || dep === self || declared.has(dep)) continue;
      // `add` routes a name provided through a declared dep to `via` itself.
      if (providedVia.has(dep) || inNodeModulesTree(dir, dep)) add(cfg, dep, rel);
    }
  }

  if (stat.size || dyn.size || typ.size || cfg.size || via.size) {
    srcRows.push([self, stat, typ, cfg, dyn, via]);
    nSrcStatic += stat.size;
    nSrcType += typ.size;
    nSrcConfig += cfg.size;
    nSrcDynamic += dyn.size;
    nSrcVia += via.size;
  }
}

console.log('Consumer-facing phantom audit\n');

if (scanned === 0) {
  console.error('ERROR: no built package `dist` found. Run `pnpm build` first.');
  process.exit(2);
}

console.log(`Scanned ${scanned} of ${publishable} publishable packages.`);
if (nonDist.length) {
  console.log(`  Plus ${nonDist.length} source-shipped package(s), scanned as published: ${nonDist.map((p) => p.name).join(', ')}`);
}
if (skipped.length) {
  console.warn(`WARNING: ${skipped.length} dist-shipping package(s) had no dist (not built?) and were NOT audited: ${skipped.join(', ')}`);
  console.warn('Run a full `pnpm build` before trusting a clean result.');
}
console.log(`  static runtime (import/require):    ${nStatic}   <- must be 0`);
console.log(`  type import (.d.ts):                ${nType}   <- must be 0`);
console.log(`  inlined external type (.d.ts):      ${nInline}   <- must be 0`);
console.log(`  via declared dep (informational):   ${nVia}`);
console.log(`  dynamic import() (informational):   ${nDynamic}\n`);

for (const [name, stat, dyn, typ, inl, via] of rows) {
  console.log(name);
  for (const [dep, files] of [...stat].sort()) console.log(`  [static]  ${dep}  (${[...files].slice(0, 2).join(', ')})`);
  for (const [dep, files] of [...typ].sort()) console.log(`  [type]    ${dep}  (${[...files].slice(0, 2).join(', ')})`);
  for (const [dep, files] of [...inl].sort()) console.log(`  [inlined] ${dep}  (${[...files].slice(0, 2).join(', ')})`);
  for (const [dep, info] of [...via].sort()) console.log(`  [via]     ${dep}  (provided by ${info.by}; ${[...info.files].slice(0, 1).join('')})`);
  for (const [dep, files] of [...dyn].sort()) console.log(`  [dynamic] ${dep}  (${[...files].slice(0, 2).join(', ')})`);
}

if (nonDist.length) {
  console.log(`\nSource-shipped packages (${nonDist.length}):`);
  console.log(`  static runtime (import/require):    ${nSrcStatic}   <- must be 0`);
  console.log(`  type import (.d.ts):                ${nSrcType}   <- must be 0`);
  console.log(`  config string reference:            ${nSrcConfig}   <- must be 0`);
  console.log(`  via declared dep (informational):   ${nSrcVia}`);
  console.log(`  dynamic import() (informational):   ${nSrcDynamic}`);
  for (const [name, stat, typ, cfg, dyn, via] of srcRows) {
    console.log(`\n${name}`);
    for (const [dep, files] of [...stat].sort()) console.log(`  [static]  ${dep}  (${[...files].slice(0, 2).join(', ')})`);
    for (const [dep, files] of [...typ].sort()) console.log(`  [type]    ${dep}  (${[...files].slice(0, 2).join(', ')})`);
    for (const [dep, files] of [...cfg].sort()) console.log(`  [config]  ${dep}  (referenced as a string in ${[...files].slice(0, 2).join(', ')})`);
    for (const [dep, info] of [...via].sort()) console.log(`  [via]     ${dep}  (provided by ${info.by}; ${[...info.files].slice(0, 1).join('')})`);
    for (const [dep, files] of [...dyn].sort()) console.log(`  [dynamic] ${dep}  (${[...files].slice(0, 2).join(', ')})`);
  }
  if (globbedFiles.size) {
    console.warn(`\nWARNING: glob pattern in \`files\` — published set only partly scanned: ${[...globbedFiles].join(', ')}`);
  }
  if (configLoadFailures.length) {
    console.warn(`\nWARNING: could not load ${configLoadFailures.length} published module(s); their config strings were NOT checked:`);
    for (const f of configLoadFailures) console.warn(`  ${f}`);
  }
}

if (nStatic > 0 || nType > 0 || nInline > 0 || nSrcStatic > 0 || nSrcType > 0 || nSrcConfig > 0) {
  if (nStatic > 0 || nType > 0 || nSrcStatic > 0 || nSrcType > 0) {
    console.error('\nFAIL: undeclared static-runtime or type imports remain in published files.');
    console.error('Declare them in the package (dependencies / peerDependencies), see docs/dependency-management.md.');
  }
  if (nInline > 0) {
    console.error('\nFAIL: an undeclared external package\'s types are INLINED into a published `.d.ts`.');
    console.error('Declare that package (dependencies / peerDependencies) so the bundler emits an `import(\'pkg\')` reference instead of copying its types in. See docs/dependency-management.md ("inlined external types").');
  }
  if (nSrcConfig > 0) {
    console.error('\nFAIL: a source-shipped config names an undeclared package as a STRING (`extends` / `plugins` / `customSyntax` / ...).');
    console.error('It resolves here through the root, so nothing in this repository fails — the consumer gets a load error. Declare it, or drop the reference. See docs/dependency-management.md.');
  }
  process.exit(1);
}
console.log('\nOK: no hard consumer-facing phantoms. Any [dynamic] entries must be guarded, intentionally-optional imports.');
