import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as sass from 'sass';
import { generator } from '../generator';
import { createRecommendedSettings } from '../recommended';

let dest: string;
let scssPath: string;

beforeAll(async () => {
  dest = fs.mkdtempSync(path.join(os.tmpdir(), 'media-match-gen-'));
  const result = await generator({ src: createRecommendedSettings(), dest });
  scssPath = result.scss.path;
});

afterAll(() => {
  fs.rmSync(dest, { recursive: true, force: true });
});

/**
 * Compile a stylesheet that drives the generated helpers, collecting the
 * deprecations Sass reports along the way.
 *
 * The generated SCSS is only ever read by a consuming project's stylesheets, so
 * anything deprecated in it surfaces there -- once per root stylesheet that
 * reaches it, which is how a couple of call sites became hundreds of warnings
 * in a real build.
 */
function compile(body: string) {
  const deprecations: string[] = [];
  const { css } = sass.compileString(
    `@use '${scssPath.replace(/\\/g, '/')}' as mm;\n${body}`,
    {
      url: pathToFileURL(path.join(dest, 'consumer.scss')),
      logger: {
        warn(_message, options) {
          if (options.deprecation) {
            deprecations.push(options.deprecationType.id);
          }
        },
      },
    },
  );
  return { css, deprecations };
}

describe('generated media-match.scss', () => {
  it('reports no deprecations when its helpers are used', () => {
    const { deprecations } = compile(`
      .a { @include mm.mq(md) { color: red; } }
      .b { @include mm.mq(md, lg) { color: blue; } }
      .c { @include mm.mq-each() { color: green; } }
    `);
    expect(deprecations).toEqual([]);
  });

  it('joins multiple conditions with the glue', () => {
    const { css } = compile('.b { @include mm.mq(md, lg) { color: blue; } }');
    expect(css).toContain(', ');
    expect(css).toContain('.b {\n    color: blue;');
  });

  it('leaves the first mq-each pass unprefixed and suffixes the rest', () => {
    const { css } = compile(
      '@include mm.mq-each() { .x-#{mm.$mq-each-prefix}a { color: red; } }',
    );
    expect(css).toContain('.x-a {');
    expect(css).toContain('.x-md-a {');
  });
});
