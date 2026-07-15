// Consumer-facing phantom dependency audit (dist-based).
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
import { fileURLToPath } from 'node:url';

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
const skipped = [], nonDist = [];

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
    // Doesn't ship from dist (config / source-shipped) -> outside this audit.
    (expectsDist(pkg) ? skipped : nonDist).push(pkg.name);
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

console.log('Consumer-facing phantom audit (dist-based)\n');

if (scanned === 0) {
  console.error('ERROR: no built package `dist` found. Run `pnpm build` first.');
  process.exit(2);
}

console.log(`Scanned ${scanned} of ${publishable} publishable packages.`);
if (nonDist.length) {
  console.log(`  (${nonDist.length} ship without a dist build and are outside this dist-based audit: ${nonDist.join(', ')})`);
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

if (nStatic > 0 || nType > 0 || nInline > 0) {
  if (nStatic > 0 || nType > 0) {
    console.error('\nFAIL: undeclared static-runtime or type imports remain in published dist.');
    console.error('Declare them in the package (dependencies / peerDependencies), see docs/dependency-management.md.');
  }
  if (nInline > 0) {
    console.error('\nFAIL: an undeclared external package\'s types are INLINED into a published `.d.ts`.');
    console.error('Declare that package (dependencies / peerDependencies) so the bundler emits an `import(\'pkg\')` reference instead of copying its types in. See docs/dependency-management.md ("inlined external types").');
  }
  process.exit(1);
}
console.log('\nOK: no hard consumer-facing phantoms. Any [dynamic] entries must be guarded, intentionally-optional imports.');
