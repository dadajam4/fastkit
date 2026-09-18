// Published declaration audit.
//
// A package's `.d.mts` is the only thing a consumer's type checker ever sees,
// and it is checked in *their* project, not ours. `pnpm typecheck` compiles our
// sources against the workspace, where every peer is installed and every
// internal package resolves through the workspace link -- so a declaration that
// cannot stand on its own passes here and fails there. Consumers running
// `skipLibCheck: true` (the common default) do not see the failure either; the
// broken types silently degrade to `any`, which is how `@fastkit/catcher` came
// to hand out unchecked axios members for a whole major (issue #233).
//
// This type-checks each published package's emitted declarations in isolation,
// with `skipLibCheck: false`, and reports defects that live in our own
// `packages/*/dist`. Errors raised inside a third-party `.d.ts` are ignored: we
// do not own them, and they are noise from dependencies that are themselves not
// standalone-clean.
//
// `types` is set from what the package declares: `['node']` when it asks for
// `@types/node`, `[]` otherwise. A package that uses `Buffer` or `NodeJS.*` in
// its published types without declaring `@types/node` is a finding, not noise --
// the consumer has no reason to have those globals.
//
// Blind spot: this resolves inside the workspace, so it cannot see a dependency
// that is missing from the consumer's install or pinned to a different major.
// An optional peer (#233) and a peer range wider than what the types were
// emitted against (#235) both pass here. Those need a packed install outside the
// repo.
//
// Requires `pnpm build` first -- it reads `dist`.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');
const TSC = path.join(ROOT, 'node_modules/.bin/tsc');

/**
 * Defects that are already filed, keyed by the package whose `dist` holds them.
 *
 * They stay listed until the fix lands, so the audit can run in CI without
 * having to be silent about the rest. Remove an entry with its fix -- an entry
 * that no longer reproduces is reported as stale.
 */
const KNOWN = {
  // `typeof VuePlugin` survives an import the emitter dropped.
  '@fastkit/plugboy-vue-plugin': 239,
  // Node types in the public surface, with no `@types/node` declared.
  '@fastkit/helpers': 240,
  '@fastkit/plugboy': 240,
  '@fastkit/tiny-logger': 240,
  '@fastkit/cookies': 240,
  '@fastkit/vue-page': 240,
  // Type-only references to packages provided transitively by `@fastkit/vui`,
  // which does not resolve under pnpm's layout.
  '@fastkit/vui-wysiwyg': 241,
};

function readPackages() {
  const out = [];
  for (const name of fs.readdirSync(PACKAGES_DIR).sort()) {
    const dir = path.join(PACKAGES_DIR, name);
    const manifest = path.join(dir, 'package.json');
    if (!fs.existsSync(manifest)) continue;
    const json = JSON.parse(fs.readFileSync(manifest, 'utf8'));
    if (json.private) continue;
    const dist = path.join(dir, 'dist');
    if (!fs.existsSync(dist)) continue;
    const declarations = fs
      .readdirSync(dist)
      .filter((f) => f.endsWith('.d.mts'))
      .map((f) => path.join(dist, f));
    if (!declarations.length) continue;
    out.push({
      name: json.name,
      dir,
      declarations,
      // Only give the checker the ambient Node types the package actually asks
      // its consumers for.
      node: !!(
        json.dependencies?.['@types/node'] || json.peerDependencies?.['@types/node']
      ),
    });
  }
  return out;
}

function check(pkg, tmp) {
  const config = path.join(tmp, `${pkg.name.replace(/[@/]/g, '_')}.json`);
  fs.writeFileSync(
    config,
    JSON.stringify({
      compilerOptions: {
        strict: true,
        target: 'esnext',
        module: 'preserve',
        moduleResolution: 'bundler',
        noEmit: true,
        skipLibCheck: false,
        types: pkg.node ? ['node'] : [],
        lib: ['esnext', 'DOM'],
      },
      files: pkg.declarations,
    }),
  );

  return new Promise((resolve) => {
    execFile(TSC, ['-p', config], { cwd: ROOT }, (_err, stdout, stderr) => {
      const lines = `${stdout}${stderr}`
        .split('\n')
        .filter((l) => /error TS\d+/.test(l))
        // Ours only. tsc prints paths relative to `cwd`.
        .filter((l) => l.startsWith('packages/') && l.includes('/dist/'));
      resolve({ pkg, lines });
    });
  });
}

async function pool(items, limit, worker) {
  const results = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await worker(items[index]);
      }
    }),
  );
  return results;
}

const packages = readPackages();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fastkit-dts-audit-'));
const checked = await pool(packages, Math.max(2, os.cpus().length), (p) =>
  check(p, tmp),
);
fs.rmSync(tmp, { recursive: true, force: true });

// A defect belongs to the package whose `dist` contains it, not to whichever
// entry point happened to pull it in -- one emitter bug in a leaf surfaces in
// every package above it.
const owners = new Map();
for (const { pkg, lines } of checked) {
  for (const line of lines) {
    const file = line.split('(')[0];
    const owner = `@fastkit/${file.split('/')[1]}`;
    if (!owners.has(owner)) {
      owners.set(owner, { messages: new Map(), surfacedBy: new Set() });
    }
    const entry = owners.get(owner);
    entry.surfacedBy.add(pkg.name);
    const message = line.slice(line.indexOf('error '));
    entry.messages.set(message, (entry.messages.get(message) || 0) + 1);
  }
}

const unexpected = [];
const known = [];
for (const [owner, entry] of [...owners].sort()) {
  (KNOWN[owner] ? known : unexpected).push([owner, entry]);
}

console.log(`Checked ${packages.length} published packages.`);

if (known.length) {
  console.log('\nKnown, already filed:');
  for (const [owner, entry] of known) {
    console.log(
      `  ${owner} -- #${KNOWN[owner]} (${entry.messages.size} distinct error${entry.messages.size === 1 ? '' : 's'})`,
    );
  }
}

const stale = Object.keys(KNOWN).filter((owner) => !owners.has(owner));
if (stale.length) {
  console.log('\nNo longer reproduces -- drop from KNOWN:');
  for (const owner of stale) {
    console.log(`  ${owner} -- #${KNOWN[owner]}`);
  }
}

if (unexpected.length) {
  console.log('\nNot filed:');
}
for (const [owner, entry] of unexpected) {
  console.log(`\n${owner}`);
  console.log(`  surfaced when checking: ${[...entry.surfacedBy].sort().join(', ')}`);
  for (const [message, count] of [...entry.messages].sort()) {
    console.log(`  ${count > 1 ? `${count}x ` : ''}${message}`);
  }
}

if (unexpected.length || stale.length) {
  if (unexpected.length) {
    console.log(
      `\n${unexpected.length} package(s) emit declarations that do not type-check on their own and are not filed yet.`,
    );
  }
  process.exit(1);
}

console.log(
  known.length
    ? `\nNo new defects. ${known.length} package(s) still carry filed ones.`
    : '\nEvery published declaration type-checks on its own.',
);
