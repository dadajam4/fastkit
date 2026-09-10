// `engines.node` audit.
//
// Every package that runs in Node must say which Node it needs, and the
// declaration must not promise more than its dependencies allow. `engines` is
// the only signal a consumer gets at install time: without it a project on an
// older Node installs cleanly and then dies at run time, and the crash names a
// transitive package rather than the requirement it violated. `@fastkit/vui`
// 1.7.0 shipped `execa@10` (`>=22`) through `@fastkit/node-util` with no
// `engines` anywhere in the chain, so Node 20 projects failed at build with
// `TEXT_ENCODINGS.union is not a function` (issue #212) -- and only in CI or a
// container, since a developer on a newer Node saw everything green.
//
// For each package this recomputes the floor implied by its own shipped
// dependencies -- `dependencies` plus non-optional `peerDependencies`, walking
// workspace packages transitively -- and fails when a package that runs in
// Node either omits `engines.node` or declares a floor below it.
//
// Optional peers are excluded: they are reachable only through an opt-in
// subpath, so their floor is not imposed on every consumer. Browser-only
// libraries declare nothing even when a transitive dependency carries a floor.
// See docs/dependency-management.md for the policy and for how to classify a
// new package.
//
// Reads package.json only -- no build required.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');

/**
 * Packages that execute in Node, and so owe consumers an `engines.node`.
 *
 * Build tooling and CLIs, the lint config presets (the runner loads them in
 * Node), the build-time generators, and the SSR runtime. A package only ever
 * evaluated in a browser stays out even if a transitive dependency has a
 * floor: `@fastkit/vui-wysiwyg` inherits one from `@fastkit/vui` and runs
 * nothing in Node itself.
 *
 * Add a package here when it gains Node-executed code.
 */
const RUNS_IN_NODE = new Set([
  '@fastkit/color-scheme-gen',
  '@fastkit/cookies',
  '@fastkit/eslint-config',
  '@fastkit/eslint-config-vue',
  '@fastkit/hashed-sync',
  '@fastkit/icon-font-gen',
  '@fastkit/media-match-gen',
  '@fastkit/node-util',
  '@fastkit/nodepack',
  '@fastkit/plugboy',
  '@fastkit/plugboy-sass-plugin',
  '@fastkit/plugboy-vanilla-extract-plugin',
  '@fastkit/plugboy-vue-jsx-plugin',
  '@fastkit/plugboy-vue-plugin',
  '@fastkit/sprite-images',
  '@fastkit/stylelint-config',
  '@fastkit/stylelint-config-vue',
  '@fastkit/ts-tiny-meta',
  '@fastkit/vite-kit',
  '@fastkit/vite-plugin-vui',
  '@fastkit/vot',
  '@fastkit/vot-i18n',
  '@fastkit/vue-page',
  '@fastkit/vue-tiny-meta',
  '@fastkit/vui',
]);

const packages = new Map();
for (const dir of fs.readdirSync(PACKAGES_DIR)) {
  const file = path.join(PACKAGES_DIR, dir, 'package.json');
  if (!fs.existsSync(file)) continue;
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (json.private) continue;
  packages.set(json.name, { dir: path.join(PACKAGES_DIR, dir), json });
}

const parse = (v) => {
  const [major = 0, minor = 0, patch = 0] = v.split('.').map(Number);
  return [major, minor, patch];
};
const compare = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const format = (v) => v.join('.');

/**
 * The lowest Node an `engines.node` range admits.
 *
 * Only the floor matters here. A range like `^22.18.0 || >=24.11.0` excludes
 * Node 23, but modelling that would mean reproducing semver's range algebra to
 * describe an odd-numbered release nobody deploys.
 */
function rangeFloor(range) {
  if (!range) return null;
  let min = null;
  for (const alternative of range.split('||')) {
    const found = alternative.match(/(\d+(?:\.\d+){0,2})/);
    if (!found) continue;
    const version = parse(found[1]);
    if (!min || compare(version, min) < 0) min = version;
  }
  return min;
}

/** Resolve an external dependency the way Node would from `fromDir`. */
function externalFloor(fromDir, dep) {
  let dir = fromDir;
  for (;;) {
    const file = path.join(dir, 'node_modules', dep, 'package.json');
    if (fs.existsSync(file)) {
      const json = JSON.parse(fs.readFileSync(file, 'utf8'));
      return {
        floor: rangeFloor(json.engines?.node),
        label: `${dep}@${json.version} (${json.engines?.node})`,
      };
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const cache = new Map();

function requiredFloor(name, stack = new Set()) {
  if (cache.has(name)) return cache.get(name);
  if (stack.has(name)) return { floor: null, source: null };
  stack.add(name);

  const entry = packages.get(name);
  if (!entry) return { floor: null, source: null };

  const optional = entry.json.peerDependenciesMeta || {};
  const shipped = [
    ...Object.keys(entry.json.dependencies || {}),
    ...Object.keys(entry.json.peerDependencies || {}).filter(
      (dep) => !optional[dep]?.optional,
    ),
  ];

  let floor = null;
  let source = null;
  for (const dep of shipped) {
    const found = packages.has(dep)
      ? (() => {
          const sub = requiredFloor(dep, stack);
          return sub.floor && { floor: sub.floor, label: `${dep} -> ${sub.source}` };
        })()
      : externalFloor(entry.dir, dep);
    if (!found?.floor) continue;
    if (!floor || compare(found.floor, floor) > 0) {
      floor = found.floor;
      source = found.label;
    }
  }

  const result = { floor, source };
  cache.set(name, result);
  stack.delete(name);
  return result;
}

const missing = [];
const tooLow = [];
const unnecessary = [];

for (const name of [...packages.keys()].sort()) {
  const { floor, source } = requiredFloor(name);
  const declared = packages.get(name).json.engines?.node;

  if (!RUNS_IN_NODE.has(name)) {
    if (declared) unnecessary.push({ name, declared });
    continue;
  }
  if (!floor) continue;

  if (!declared) {
    missing.push({ name, floor, source });
    continue;
  }
  const declaredFloor = rangeFloor(declared);
  if (!declaredFloor || compare(declaredFloor, floor) < 0) {
    tooLow.push({ name, declared, floor, source });
  }
}

for (const { name, floor, source } of missing) {
  console.error(
    `MISSING  ${name}: runs in Node and needs >=${format(floor)} (${source}), but declares no engines.node`,
  );
}
for (const { name, declared, floor, source } of tooLow) {
  console.error(
    `TOO LOW  ${name}: declares "${declared}" but needs >=${format(floor)} (${source})`,
  );
}
for (const { name, declared } of unnecessary) {
  console.log(
    `note: ${name} declares engines.node "${declared}" but is not listed as running in Node -- add it to RUNS_IN_NODE or drop the declaration`,
  );
}

const failures = missing.length + tooLow.length;
if (failures > 0) {
  console.error(
    `\n${failures} package(s) with an engines.node that does not match their dependencies. See docs/dependency-management.md.`,
  );
  process.exit(1);
}
console.log(
  `OK: ${RUNS_IN_NODE.size} Node-executing packages declare an engines.node at or above their dependencies' floor.`,
);
