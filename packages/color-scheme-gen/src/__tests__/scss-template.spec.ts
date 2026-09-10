import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as sass from 'sass';
import { Eta } from 'eta';
import {
  BUILTIN_COLOR_VARIANTS,
  type BuiltinColorVariant,
} from '@fastkit/color-scheme';
import { createSimpleColorScheme } from '../builtins';
import { toScssValues } from '../to-scss-values';

const PACKAGE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

/**
 * The authoring copy of what `LoadColorSchemeRunner` renders.
 *
 * The runner reads these out of `dist/`, which `pnpm test` does not depend on,
 * so read the sources plugboy copies from instead.
 */
const TEMPLATE_DIR = path.join(PACKAGE_DIR, 'public/templates');

function readTemplate(name: string) {
  return fs.readFileSync(path.join(TEMPLATE_DIR, `${name}.tmpl`), 'utf8');
}

let scssPath: string;
let dir: string;

beforeAll(async () => {
  const scheme = createSimpleColorScheme();
  const eta = new Eta();

  // The subset of `TemplateScope` that `scss.tmpl` actually reads, wired to the
  // same templates and values the runner uses.
  const scope = {
    // `toScssValues` takes the erased `ColorScheme<any, ...>` the loader works
    // with, and the fully-inferred scheme is not assignable to it.
    scssValues: toScssValues(scheme as any),
    async allVariantsScss() {
      const results = await Promise.all(
        scheme.variants.map((variant) =>
          BUILTIN_COLOR_VARIANTS.includes(variant as BuiltinColorVariant)
            ? eta.renderStringAsync(readTemplate(`variant.${variant}`), {
                selector: variant,
              })
            : '',
        ),
      );
      return results.join('\n');
    },
  };

  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'color-scheme-gen-'));
  scssPath = path.join(dir, 'color-scheme.scss');
  fs.writeFileSync(
    scssPath,
    await eta.renderStringAsync(readTemplate('scss'), scope),
  );
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
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
    `@use '${scssPath.replace(/\\/g, '/')}' as cs;\n${body}`,
    {
      url: pathToFileURL(path.join(dir, 'consumer.scss')),
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

describe('generated color-scheme.scss', () => {
  it('reports no deprecations when its helpers are used', () => {
    const { deprecations } = compile(`
      .a { @include cs.palette-border(primary); }
      .b { @include cs.palette-border(primary, 'top'); }
      @include cs.dump-color-scheme();
    `);
    expect(deprecations).toEqual([]);
  });

  it('targets every side when no direction is given', () => {
    const { css } = compile('.a { @include cs.palette-border(primary); }');
    expect(css).toContain('border-color: var(--palette-primary);');
  });

  it('targets one side when a direction is given', () => {
    const { css } = compile(
      ".a { @include cs.palette-border(primary, 'top'); }",
    );
    expect(css).toContain('border-top-color: var(--palette-primary);');
  });
});
