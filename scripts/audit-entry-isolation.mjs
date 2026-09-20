// Runtime isolation audit for published entry points.
//
// A package can advertise that it runs anywhere and still be unusable outside
// Node, because one module somewhere in its core import graph names `node:*`.
// Nothing fails at build time: the leak only surfaces when someone bundles the
// package for a Worker or Deno, and the error names a transitive chunk rather
// than the entry that pulled it in.
//
// `@fastkit/vot` is the case this exists for. Its render core is meant to run
// on any runtime, and its Node server lives behind `@fastkit/vot/adapters/node`
// -- which names `node:http` and `@hono/node-server` by design. The separation
// is a correctness requirement, not hygiene, so it is checked rather than
// assumed.
//
// Reads `dist/` -- run after a build.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Entries that must stay free of runtime-specific modules, and what they must
 * stay free of. Paths are the published subpath, as `exports` spells it.
 */
const RULES = [
  {
    package: '@fastkit/vot',
    entry: '.',
    forbidden: [/^node:/, '@hono/node-server', 'connect', 'express'],
    because:
      'the render core is meant to run on any runtime; Node belongs behind @fastkit/vot/adapters/node',
  },
];

const SPECIFIER_RES = [
  /\bfrom\s*['"]([^'"]+)['"]/g,
  // Side-effect-only imports carry no binding, so nothing else here sees them.
  /\bimport\s+['"]([^'"]+)['"]/g,
  /\bimport\s*\(\s*['"]([^'"]+)['"]/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]/g,
];

function specifiersOf(file) {
  const source = fs.readFileSync(file, 'utf8');
  const found = new Set();
  for (const re of SPECIFIER_RES) {
    for (const match of source.matchAll(re)) found.add(match[1]);
  }
  return [...found];
}

/** Follow relative imports so a leak cannot hide one chunk deep. */
function reachableFiles(entryFile) {
  const seen = new Set();
  const queue = [entryFile];
  const external = new Set();

  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file) || !fs.existsSync(file)) continue;
    seen.add(file);
    for (const specifier of specifiersOf(file)) {
      if (specifier.startsWith('.')) {
        queue.push(path.resolve(path.dirname(file), specifier));
      } else {
        external.add(specifier);
      }
    }
  }
  return { files: seen, external };
}

function matches(specifier, pattern) {
  return pattern instanceof RegExp
    ? pattern.test(specifier)
    : specifier === pattern || specifier.startsWith(`${pattern}/`);
}

let failed = false;
let checked = 0;

for (const rule of RULES) {
  const dir = path.join(ROOT, 'packages', rule.package.split('/')[1]);
  const pkg = JSON.parse(
    fs.readFileSync(path.join(dir, 'package.json'), 'utf8'),
  );
  const target = pkg.exports?.[rule.entry];
  const jsPath = target?.import?.default || target?.default;
  const dtsPath = target?.types;

  if (!jsPath) {
    console.error(
      `  ${rule.package} has no "${rule.entry}" export. Build first, or fix the rule.`,
    );
    failed = true;
    continue;
  }

  for (const [label, relative] of [
    ['runtime', jsPath],
    ['types', dtsPath],
  ]) {
    if (!relative) continue;
    const entryFile = path.join(dir, relative);
    if (!fs.existsSync(entryFile)) {
      console.error(`  missing ${entryFile} -- run \`pnpm build\` first.`);
      failed = true;
      continue;
    }

    checked += 1;
    const { external } = reachableFiles(entryFile);
    const leaks = [...external].filter((specifier) =>
      rule.forbidden.some((pattern) => matches(specifier, pattern)),
    );

    if (leaks.length) {
      failed = true;
      console.error(
        `\n${rule.package} "${rule.entry}" (${label}) reaches ${leaks
          .map((leak) => `"${leak}"`)
          .join(', ')}`,
      );
      console.error(`  ${rule.because}`);
    }
  }
}

if (failed) {
  console.error('\nEntry isolation audit failed.');
  process.exit(1);
}

console.log(
  `OK: ${checked} published entries carry nothing from a runtime they do not target.`,
);
