// Consumer-facing phantom dependency audit (dist-based).
//
// Scans every published package's built `dist` for import specifiers that are
// NOT declared in its own dependencies / peerDependencies / optionalDependencies.
// Consumers do not receive devDependencies, and bundled imports never appear in
// `dist` — so an undeclared `dist` import is exactly what breaks a consumer who
// does NOT enable `shamefully-hoist`. See docs/dependency-management.md.
//
// Severity:
//   - static runtime import (`import … from` / `require`) -> HARD runtime break
//   - type import in `.d.ts`                              -> breaks consumer typecheck
//   - dynamic `import()`                                  -> usually optional / guarded
//
// Exit 1 if any static-runtime or type phantom is found. Dynamic imports are
// reported for review but do not fail (they are typically try/catch-guarded
// optional features — declaring them would force-install the module for every
// consumer; see docs/dependency-management.md).
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
let nStatic = 0, nDynamic = 0, nType = 0, scanned = 0;

for (const name of readdirSync(pkgsBase)) {
  const dir = join(pkgsBase, name);
  const pj = join(dir, 'package.json');
  const dist = join(dir, 'dist');
  if (!existsSync(pj) || !existsSync(dist)) continue;
  const pkg = JSON.parse(readFileSync(pj, 'utf8'));
  if (pkg.private) continue;
  scanned += 1;
  const declared = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
  ]);
  const self = pkg.name;
  const stat = new Map(), dyn = new Map(), typ = new Map();
  for (const f of walk(dist)) {
    const isRT = RT.test(f), isDT = DT.test(f);
    if (!isRT && !isDT) continue;
    let code;
    try { code = stripComments(readFileSync(f, 'utf8')); } catch { continue; }
    const staticSpecs = new Set(), dynSpecs = new Set();
    for (const re of STATIC_RES) collect(re, code, staticSpecs);
    collect(DYNAMIC_RE, code, dynSpecs);
    const add = (specs, bucket) => {
      for (const s of specs) {
        const dep = toPkg(s);
        if (!dep || dep === self || declared.has(dep)) continue;
        if (!bucket.has(dep)) bucket.set(dep, new Set());
        bucket.get(dep).add(relative(dir, f));
      }
    };
    if (isDT) add(new Set([...staticSpecs, ...dynSpecs]), typ);
    else { add(staticSpecs, stat); add(dynSpecs, dyn); }
  }
  if (stat.size || dyn.size || typ.size) {
    rows.push([self, stat, dyn, typ]);
    nStatic += stat.size;
    nDynamic += dyn.size;
    nType += typ.size;
  }
}

console.log('Consumer-facing phantom audit (dist-based)\n');

if (scanned === 0) {
  console.error('ERROR: no built package `dist` found. Run `pnpm build` first.');
  process.exit(2);
}

console.log(`Scanned ${scanned} published packages.`);
console.log(`  static runtime (import/require): ${nStatic}   <- must be 0`);
console.log(`  type (.d.ts):                    ${nType}   <- must be 0`);
console.log(`  dynamic import() (informational): ${nDynamic}\n`);

for (const [name, stat, dyn, typ] of rows) {
  console.log(name);
  for (const [dep, files] of [...stat].sort()) console.log(`  [static]  ${dep}  (${[...files].slice(0, 2).join(', ')})`);
  for (const [dep, files] of [...typ].sort()) console.log(`  [type]    ${dep}  (${[...files].slice(0, 2).join(', ')})`);
  for (const [dep, files] of [...dyn].sort()) console.log(`  [dynamic] ${dep}  (${[...files].slice(0, 2).join(', ')})`);
}

if (nStatic > 0 || nType > 0) {
  console.error('\nFAIL: undeclared static-runtime or type imports remain in published dist.');
  console.error('Declare them in the package (dependencies / peerDependencies), see docs/dependency-management.md.');
  process.exit(1);
}
console.log('\nOK: no hard consumer-facing phantoms. Any [dynamic] entries must be guarded, intentionally-optional imports.');
