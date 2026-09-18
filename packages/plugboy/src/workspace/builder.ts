import { type InlineConfig, build } from 'tsdown';
import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import type { PlugboyWorkspace, WorkspaceObjectExport } from './workspace';
import {
  TSDOWN_SYNC_OPTIONS,
  NormalizedDTSPreserveTypeSettings,
} from '../types';
import {
  copyDirSync,
  rmrf,
  mergeExternals,
  stripDanglingDTSSourceMaps,
} from '../utils';
import { emitDTS } from './dts';
import { applyPlugboyEnvs, getPlugboyEnvCodeForStub } from '../env';

const SHEBANG_MATCH_RE = /^(#!.+?)\n/;

/**
 * Escape a string for use inside a `RegExp`.
 *
 * Kept local: plugboy builds every other package, so it cannot depend on one.
 */
function escapeRegExp(source: string): string {
  return source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Every name the declaration file already binds -- imported from any module, or
 * declared in the file itself.
 *
 * `X as Y` binds `Y`, so the local name is what matters rather than the
 * exported one.
 */
function collectBoundNames(dts: string): Set<string> {
  const names = new Set<string>();

  for (const [, clause] of dts.matchAll(
    /^import\s+([^;]+?)\s+from\s+['"][^'"]+['"];?$/gm,
  )) {
    const braced = clause.match(/\{([^{}]*)\}/);
    if (braced) {
      for (const specifier of braced[1].split(',')) {
        const local = specifier.split(' as ').pop()?.trim();
        if (local) names.add(local);
      }
    }
    const head = clause
      .replace(/\{[^{}]*\}/, '')
      .replace(/,/g, ' ')
      .trim();
    const namespaced = head.match(/\*\s+as\s+([\w$]+)/);
    if (namespaced) {
      names.add(namespaced[1]);
    } else if (/^[\w$]+$/.test(head)) {
      names.add(head);
    }
  }

  for (const [, name] of dts.matchAll(
    /^(?:export\s+)?(?:declare\s+)?(?:type|interface|class|const|function)\s+([\w$]+)/gm,
  )) {
    names.add(name);
  }

  return names;
}

interface ResolvedOptions extends InlineConfig {}

export class Builder {
  readonly workspace: PlugboyWorkspace;

  private _tsdownOptions?: ResolvedOptions;

  get entry() {
    return this.workspace.entry;
  }

  get dts() {
    return this.workspace.dts;
  }

  constructor(workspace: PlugboyWorkspace) {
    this.workspace = workspace;
  }

  async tsdownOptions(overrides?: {
    watch?: boolean;
  }): Promise<ResolvedOptions> {
    const { _tsdownOptions } = this;
    if (_tsdownOptions) return _tsdownOptions;

    const { entry, dts } = this;

    const resolvedOptions: ResolvedOptions = {
      dts:
        dts.inline || typeof dts.compiler === 'function'
          ? false
          : dts.compiler === 'vue-tsc'
            ? { vue: true }
            : true,
      treeshake: true,
      css: this.workspace.cssOptions,
      plugins: this.workspace.plugins,
      entry,
      sourcemap: true,
      clean: true,
      ...overrides,
    };

    for (const opt of TSDOWN_SYNC_OPTIONS) {
      resolvedOptions[opt] = this.workspace.config[opt] as any;
    }

    applyPlugboyEnvs(resolvedOptions);

    resolvedOptions.deps ??= {};
    resolvedOptions.deps.neverBundle = mergeExternals(
      resolvedOptions.deps.neverBundle,
      [
        /^(@fastkit\/)?plugboy(?!\/runtime-utils)/,
        ...this.workspace.dependencies,
      ],
    );

    this._tsdownOptions = resolvedOptions;

    return resolvedOptions;
  }

  private async _stubLinkJS(from: string, to: string) {
    const fromParsed = path.parse(from);
    const fromDir = fromParsed.dir;
    const toParsed = path.parse(to);
    const toRelativeDir = path.relative(fromDir, toParsed.dir);
    const location = path.join(toRelativeDir, toParsed.base);
    const source = await fs.readFile(to, 'utf-8');
    const shebang = source.match(SHEBANG_MATCH_RE)?.[1];
    const disableChecks = '/* eslint-disable */\n// @ts-nocheck\n';
    const code = `${disableChecks}${getPlugboyEnvCodeForStub()}\nexport * from '${location}';`;
    const dtsPath = path.join(fromDir, `${fromParsed.name}.d.mts`);
    const dtsCode = `${disableChecks}export * from '${location.replace(
      /\.ts$/,
      '',
    )}';`;
    const srcFromDir = path.dirname(from);
    const dtsDir = path.dirname(dtsPath);
    await Promise.all(
      [srcFromDir, dtsDir].map((dir) => fs.mkdir(dir, { recursive: true })),
    );
    await Promise.all([
      fs.writeFile(from, `${shebang ? `${shebang}\n` : ''}${code}`),
      fs.writeFile(dtsPath, dtsCode),
    ]);
  }

  private async _stubLinkCSS(from: string) {
    const code = `/* noop */`;
    await fs.writeFile(from, code);
  }

  /**
   * Copy the workspace's `publicDir` contents into the output directory.
   *
   * Owned by plugboy (not tsdown's `copy`) so the result is identical in `build`
   * and `stub`: both call this with plugboy's own recursive copy. `copyDirSync`
   * no-ops when the directory is absent, so packages without a public directory
   * are unaffected. tsdown's `copy` option is left to tsdown and only applies
   * during a real `build`.
   */
  copyPublicDir() {
    const { publicDir } = this.workspace.config;
    if (!publicDir) return;
    copyDirSync(
      this.workspace.dir.join(publicDir).value,
      this.workspace.dirs.dist.value,
    );
  }

  async stub() {
    const links = this.workspace.getStubLinks();
    this.copyPublicDir();
    await Promise.all(
      links.map((link) => {
        if (link.type === 'js') {
          return this._stubLinkJS(link.from, link.to);
        }
        if (link.type === 'css') {
          return this._stubLinkCSS(link.from);
        }
        throw new Error(`non supported type`);
      }),
    );
    await fs.writeFile(
      this.workspace.dirs.dist.join('.stub').value,
      '',
      'utf-8',
    );
  }

  normalizeDTSBySettings(
    dts: string,
    settings: NormalizedDTSPreserveTypeSettings,
  ): string | undefined {
    const { targets, pkg } = settings;
    const myPackageName = this.workspace.json.name;
    const packageIsOwn = myPackageName === pkg;
    // The statement this normalizer merges into, if the file already imports
    // from the package. The declaration bundler quotes its specifiers with `"`
    // while this normalizer wrote `'`, and matching only the latter made every
    // bundled import invisible here -- the names were then prepended as a
    // second import of the same module and each one ended up bound twice
    // (issue #234).
    const target = (() => {
      if (!pkg || packageIsOwn) return;
      const re = new RegExp(
        `import {([^{}]+)} from (['"])${escapeRegExp(pkg)}\\2`,
      );
      const matched = dts.match(re);
      if (!matched) return;
      const [statement, specifiers, quote] = matched;
      return { statement, specifiers, quote };
    })();

    const hitTypeNames: string[] = [];
    targets.forEach(({ from, typeName }) => {
      const matched = dts.match(from);
      if (matched) {
        hitTypeNames.push(typeName);
        dts = dts.replace(from, typeName);
      }
    });

    if (!hitTypeNames.length) return;

    // Whether the file can already refer to a name, from any module -- these
    // types are re-exported (`ScopeName` reaches `@fastkit/vui` through both
    // `@fastkit/color-scheme` and `@fastkit/vue-color-scheme`), so importing
    // one a second time binds it twice even though the modules differ.
    const bound = collectBoundNames(dts);
    const appends = [...new Set(hitTypeNames)].filter(
      (typeName) => !bound.has(typeName),
    );

    if (!appends.length) return dts;

    if (target) {
      const { statement, specifiers, quote } = target;
      const merged = `import { ${specifiers.trim()}, ${appends.join(
        ', ',
      )} } from ${quote}${pkg}${quote}`;
      // A replacer function, because emitted names carry `$` suffixes
      // (`ColorVariant$1`) that `String.replace` reads as group references.
      dts = dts.replace(statement, () => merged);
    } else if (pkg && !packageIsOwn) {
      dts = `import { ${appends.join(', ')} } from '${pkg}';\n${dts}`;
    }
    return dts;
  }

  async normalizeDTSFile(filePath: string) {
    const dts = await fs.readFile(filePath, 'utf-8');
    const { preserveType, normalizers } = this.dts;
    let normalized = dts;
    let processed = false;
    for (const settings of preserveType) {
      const _normalized = this.normalizeDTSBySettings(normalized, settings);
      if (_normalized) {
        processed = true;
        normalized = _normalized;
      }
    }
    for (const normalizer of normalizers) {
      const _normalized = await normalizer(normalized, this);
      if (_normalized && normalized !== _normalized) {
        processed = true;
        normalized = _normalized;
      }
    }
    if (!processed) {
      return;
    }
    await fs.writeFile(filePath, normalized, 'utf-8');
  }

  async normalizeDTSFiles(dtsFiles: string[] = this.workspace.dtsFiles) {
    const { preserveType } = this.dts;
    if (!preserveType.length || !dtsFiles.length) return;

    await Promise.all(
      dtsFiles.map((filePath) => this.normalizeDTSFile(filePath)),
    );
  }

  async emitDTSManually() {
    const { dir, dirs, exports } = this.workspace;
    const cwd = dir.value;
    const outDir = dirs.dist.join('.dts-generate').value;
    const dtsSrcDir = path.join(outDir, 'src');
    const dtsDest = dirs.dist.join('.dts').value;

    await emitDTS({
      cwd,
      outDir,
      workspace: this.workspace,
      compiler: this.workspace.dts.compiler,
      ignoreCompilerErrors: this.workspace.dts.ignoreCompilerErrors,
    });

    await fs.rename(dtsSrcDir, dtsDest);
    await rmrf(outDir);

    const objectExports: WorkspaceObjectExport[] = [];

    exports.forEach(({ at }) => {
      typeof at === 'object' && objectExports.push(at);
    });

    await Promise.all(
      objectExports.map(async (at) => {
        const typesDir = path.dirname(at.types);
        const dtsDestDir = path.dirname(at.dtsDest);
        const relativeDir = path.relative(typesDir, dtsDestDir);
        const relativePath = path.join(
          relativeDir,
          path.basename(at.dtsDest).replace(/\.d\.m?ts$/, ''),
        );
        const code = `export * from './${relativePath}';`;
        await fs.writeFile(at.types, code, 'utf-8');
      }),
    );

    const dtsFiles = await glob(path.join(dtsDest, '**/*.{d.ts,d.mts}'));
    await this.normalizeDTSFiles(dtsFiles);
  }

  async build() {
    const options = await this.tsdownOptions();
    await build(options);

    // After tsdown (its `clean` wipes `dist` first), so the copy survives.
    // Identical to the `stub()` path — plugboy owns the public-dir copy.
    this.copyPublicDir();

    if (this.dts.inline || typeof this.dts.compiler === 'function') {
      await this.emitDTSManually();
    } else {
      await this.normalizeDTSFiles();
    }

    await stripDanglingDTSSourceMaps(this.workspace.dirs.dist.value);
  }
}
