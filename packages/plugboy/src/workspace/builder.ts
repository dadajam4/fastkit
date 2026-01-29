import { type InlineConfig, build } from 'tsdown';
import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import type { PlugboyWorkspace, WorkspaceObjectExport } from './workspace';
import {
  TSDOWN_SYNC_OPTIONS,
  NormalizedDTSPreserveTypeSettings,
} from '../types';
import { copyDirSync, rmrf, mergeExternals } from '../utils';
import { emitDTS } from './dts';
import { applyPlugboyEnvs, getPlugboyEnvCodeForStub } from '../env';

const SHEBANG_MATCH_RE = /^(#!.+?)\n/;

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
    let { _tsdownOptions } = this;
    if (_tsdownOptions) return _tsdownOptions;

    const { entry, dts } = this;

    _tsdownOptions = {
      dts:
        dts.inline || typeof dts.compiler === 'function'
          ? false
          : dts.compiler === 'vue-tsc'
            ? { vue: true }
            : true,
      treeshake: true,
      plugins: this.workspace.plugins,
      entry,
      sourcemap: true,
      clean: true,
      ...overrides,
    };

    for (const opt of TSDOWN_SYNC_OPTIONS) {
      _tsdownOptions[opt] = this.workspace.config[opt] as any;
    }

    applyPlugboyEnvs(_tsdownOptions);

    _tsdownOptions.external = mergeExternals(_tsdownOptions.external, [
      /^(@fastkit\/)?plugboy(?!\/runtime-utils)/,
      ...this.workspace.dependencies,
    ]);

    this._tsdownOptions = _tsdownOptions;

    return _tsdownOptions;
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

  async copyPublicDir() {
    const publicDir = this.workspace.dir.join('public').value;
    await copyDirSync(publicDir, this.workspace.dirs.dist.value);
  }

  async stub() {
    const links = this.workspace.getStubLinks();
    await this.copyPublicDir();
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
    const pkgImports = (() => {
      if (!pkg || packageIsOwn) return;

      const importRe = new RegExp(`import {([^\\{\\}]+)} from '${pkg}'`);
      const importMatched = dts.match(importRe);
      const imports = importMatched && importMatched[1];
      if (!imports) return;

      return {
        pkg,
        importRe,
        imports,
      };
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

    if (pkgImports) {
      const { pkg, imports, importRe } = pkgImports;
      const mods = imports
        .trim()
        .split(',')
        .map((row) => {
          row = row.split(' as ')[0].trim();
          return row;
        });
      const appends: string[] = [];
      hitTypeNames.forEach((typeName) => {
        const re = new RegExp(`(^|\n)import { ${typeName} } from '${pkg}'`);
        if (!re.test(dts) && !mods.includes(typeName)) {
          appends.push(typeName);
        }
      });
      if (appends.length) {
        dts = dts.replace(
          importRe,
          `import { $1, ${appends.join(', ')} } from '${pkg}'`,
        );
      }
    } else if (pkg && !packageIsOwn) {
      const mods: string[] = [];
      hitTypeNames.forEach((typeName) => {
        if (!dts.includes(`export declare type ${typeName} = `)) {
          mods.push(typeName);
        }
      });
      if (mods.length) {
        dts = `import { ${mods.join(', ')} } from '${pkg}';\n${dts}`;
      }
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

    if (this.dts.inline || typeof this.dts.compiler === 'function') {
      await this.emitDTSManually();
    } else {
      await this.normalizeDTSFiles();
    }
  }
}
