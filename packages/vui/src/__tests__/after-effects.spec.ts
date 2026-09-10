import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as sass from 'sass';

const PACKAGE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const ENTRY = path.join(PACKAGE_DIR, 'public/after-effects.scss');

/**
 * What `@fastkit/vite-plugin-vui` puts in scope, reduced to the two members
 * `after-effects.scss` reads.
 *
 * The real one is generated per project from that project's own breakpoints,
 * so this stub stands in for it with a fixed pair.
 */
const MEDIA_MATCH_STUB = `
$mq-each-target: null;

@mixin mq-each() {
  @each $target, $min-width in (xs: 0px, md: 960px) {
    $mq-each-target: $target !global;

    @media (min-width: $min-width) {
      @content;
    }
  }
}
`.trim();

let stubDir: string;
let stubUse: string;

beforeAll(() => {
  stubDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vui-after-effects-'));
  const stub = path.join(stubDir, 'media-match.scss');
  fs.writeFileSync(stub, MEDIA_MATCH_STUB);
  stubUse = `@use '${stub.replace(/\\/g, '/')}' as *;\n`;
});

afterAll(() => {
  fs.rmSync(stubDir, { recursive: true, force: true });
});

/**
 * Compile the shipped entry the way Vite does.
 *
 * The media-match reaches the entry through
 * `css.preprocessorOptions.scss.additionalData`, which prepends to the *source
 * of the entry itself* -- so the prelude is prepended here too, rather than
 * `@use`d from a wrapper stylesheet. The distinction is the whole of #212: a
 * module the entry then `@use`s gets its own scope and never sees it, so
 * anything that needs `mq-each` has to live in the entry.
 *
 * `url` keeps the entry's own relative `@use` rules resolving against
 * `public/`, as they do when Vite hands the file to Sass.
 */
function compile(prelude = '') {
  const warnings: string[] = [];
  const { css } = sass.compileString(prelude + fs.readFileSync(ENTRY, 'utf8'), {
    url: pathToFileURL(ENTRY),
    logger: {
      warn(message) {
        warnings.push(message);
      },
    },
  });
  return { css, warnings };
}

describe('after-effects.scss', () => {
  it('emits the unsuffixed classes', () => {
    const { css } = compile();
    expect(css).toContain('.grid-size-6 {');
    expect(css).toContain('.mt-1 {');
    expect(css).toContain('.text-h1 {');
  });

  // The regression behind #212: moving from `@import` to `@use` put `mq-each`
  // out of each module's reach, and the `mixin-exists` guard turned that into
  // silently missing CSS rather than a build error. A grid item declared
  // per-breakpoint then matched no width rule at all.
  it('emits breakpoint-suffixed variants of every group when `mq-each` is in scope', () => {
    const { css, warnings } = compile(stubUse);

    // display-flow
    expect(css).toContain('.grid-size-6--md');
    expect(css).toContain('.grid-size-12--xs');
    expect(css).toContain('.grid-size-auto--md');
    expect(css).toContain('.order-3--xs');
    expect(css).toContain('.flex--md');
    expect(css).toContain('.grid-spacing-2--md');
    // text
    expect(css).toContain('.text-h1--md');
    expect(css).toContain('.text-center--xs');
    expect(css).toContain('.font-weight-700--md');
    // spacing
    expect(css).toContain('.mt-1--xs');
    expect(css).toContain('.px-2h--md');
    expect(css).toContain('.ml-n3--md');
    expect(css).toContain('.mx-auto--xs');

    expect(warnings).toEqual([]);
  });

  // Which group wins when two of them touch the same property -- `.text-h1--md`
  // sets `margin`, `.mt-1` sets `margin-top` -- is decided by source order, so
  // the order the legacy `@import` produced is part of the contract.
  it('keeps each group base-then-breakpoints, in module order', () => {
    const { css } = compile(stubUse);
    const offsets = [
      '.grid-size-6 {', // display-flow, unsuffixed
      '.grid-size-6--md', // display-flow, responsive
      '.text-h1 {', // text, unsuffixed
      '.text-h1--md', // text, responsive
      '.mt-1 {', // spacing, unsuffixed
      '.mt-1--md', // spacing, responsive
    ].map((needle) => css.indexOf(needle));

    expect(offsets).not.toContain(-1);
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b));
  });

  // Silently dropping every responsive class is the failure mode that took a
  // consumer's whole grid down without an error, so its absence has to say so.
  it('warns instead of silently dropping the variants when `mq-each` is absent', () => {
    const { css, warnings } = compile();

    expect(css).not.toContain('--md');
    expect(css).not.toContain('@media');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('mq-each');
  });
});
