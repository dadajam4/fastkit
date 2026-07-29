import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Integration coverage for the `css` option: run a *real* plugboy build of a
 * generated fixture and assert on the emitted stylesheet.
 *
 * `css` is handed to tsdown untouched, so the assertions observe it through the
 * output — which file name the stylesheet lands under, and whether the JS keeps
 * an import pointing at it (`inject`).
 *
 * Fixtures live under the repo root (outside `packages/**`) and are created and
 * removed at test time — see `external-imports.build.spec.ts` for the rationale.
 * Configs are plain objects (no `@fastkit/plugboy` import) so the build does not
 * depend on plugboy's own `dist` being present.
 */

const REPO_ROOT = path.resolve(__dirname, '../../..');
const TSX_BIN = path.join(REPO_ROOT, 'node_modules/.bin/tsx');
const DRIVER = path.join(__dirname, 'helpers/plugboy-build-driver.mts');
const createdDirs: string[] = [];

afterAll(() => {
  for (const dir of createdDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

const STYLE = `.fixture { color: red; }\n`;
const SOURCE = `import './style.css';

export const name = 'fixture';
`;

interface BuildResult {
  /** Names of the files emitted into `dist`. */
  distFiles: string[];
  /** The emitted JavaScript entry. */
  js: string;
}

/**
 * Build a fixture package that imports a plain stylesheet.
 *
 * `projectCss` is only meaningful together with a fixture-owned project root:
 * when it is given, a private `package.json` + `plugboy.project.ts` are written
 * to the fixture root so the project lookup stops there instead of walking up to
 * fastkit's own project config.
 */
function buildFixture(options: {
  workspaceCss?: Record<string, unknown>;
  projectCss?: Record<string, unknown>;
}): BuildResult {
  const { workspaceCss, projectCss } = options;
  const withProject = projectCss !== undefined;
  const root = path.join(
    REPO_ROOT,
    `.tmp-plugboy-css-${Date.now()}-${createdDirs.length}`,
  );
  const dir = path.join(root, 'pkg');
  createdDirs.push(root);

  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });

  if (withProject) {
    fs.writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify({ name: '@plugboy-e2e/css-project', private: true }),
    );
    fs.writeFileSync(
      path.join(root, 'plugboy.project.ts'),
      `export default ${JSON.stringify({ css: projectCss })};\n`,
    );
  }

  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: '@plugboy-e2e/css',
      version: '0.0.0',
      type: 'module',
      exports: {
        '.': { types: './dist/pkg.d.mts', import: './dist/pkg.mjs' },
        './*': './dist/*',
      },
    }),
  );
  fs.writeFileSync(
    path.join(dir, 'plugboy.workspace.ts'),
    `export default ${JSON.stringify({
      // Without a fixture-owned project root the lookup would reach fastkit's
      // own `plugboy.project.ts`; ignoring it keeps the case isolated.
      ...(withProject ? {} : { ignoreProjectConfig: true }),
      entries: { '.': { src: './src/index.ts', css: true } },
      ...(workspaceCss === undefined ? {} : { css: workspaceCss }),
    })};\n`,
  );
  fs.writeFileSync(path.join(dir, 'src/index.ts'), SOURCE);
  fs.writeFileSync(path.join(dir, 'src/style.css'), STYLE);

  spawnSync(TSX_BIN, [DRIVER, dir], { cwd: dir, encoding: 'utf8' });

  const dist = path.join(dir, 'dist');
  return {
    distFiles: fs.readdirSync(dist),
    js: fs.readFileSync(path.join(dist, 'pkg.mjs'), 'utf8'),
  };
}

describe('css option (integration)', () => {
  test('no css option anywhere leaves tsdown defaults in place', () => {
    const { distFiles, js } = buildFixture({});
    expect(distFiles).toContain('style.css');
    // `inject` defaults to false: the JS carries no import of the stylesheet.
    expect(js).not.toContain('style.css');
  }, 60_000);

  test('a workspace css option reaches tsdown', () => {
    const { distFiles } = buildFixture({
      workspaceCss: { fileName: 'from-workspace.css' },
    });
    expect(distFiles).toContain('from-workspace.css');
    expect(distFiles).not.toContain('style.css');
  }, 60_000);

  test('a project css option is inherited by the workspace', () => {
    const { distFiles } = buildFixture({
      projectCss: { fileName: 'from-project.css' },
    });
    expect(distFiles).toContain('from-project.css');
  }, 60_000);

  test('a workspace css option is shallow-merged over the project one', () => {
    // `fileName` is overridden while the project's `inject` still applies —
    // proving the two objects merge instead of one replacing the other.
    const { distFiles, js } = buildFixture({
      projectCss: { fileName: 'from-project.css', inject: true },
      workspaceCss: { fileName: 'from-workspace.css' },
    });
    expect(distFiles).toContain('from-workspace.css');
    expect(distFiles).not.toContain('from-project.css');
    expect(js).toContain('from-workspace.css');
  }, 60_000);
});
