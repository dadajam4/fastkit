import { Options, build } from 'tsup';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { PlugboyWorkspace, WorkspaceObjectExport } from './workspace';
import { TSUP_SYNC_OPTIONS, NormalizedDTSPreserveTypeSettings } from '../types';
import type { OutputFile, Plugin } from 'esbuild';
import { copyDirSync, rmrf } from '../utils';
import { emitDTS } from './dts';
import { glob } from 'glob';

const SHEBANG_MATCH_RE = /^(#!.+?)\n/;
type EnvVarName = '__PLUGBOY_DEV__' | '__PLUGBOY_STUB__';
type EnvFnName =
  | '__plugboyWorkspaceDir'
  | '__plugboySrcDir'
  | '__plugboyPublicDir';

interface ResolvedOptions extends Options {
  esbuildPlugins: Plugin[];
}

export class Builder {
  readonly workspace: PlugboyWorkspace;
  private _tsupOptions?: ResolvedOptions;

  get entry() {
    return this.workspace.entry;
  }

  get dts() {
    return this.workspace.dts;
  }

  constructor(workspace: PlugboyWorkspace) {
    this.workspace = workspace;
  }

  async tsupOptions(overrides?: { watch?: boolean }): Promise<ResolvedOptions> {
    let { _tsupOptions } = this;
    if (_tsupOptions) return _tsupOptions;

    const { entry, dts } = this;

    const esbuildPlugins = await this.workspace.getESBuildPlugins();

    _tsupOptions = {
      publicDir: true,
      format: ['esm'],
      dts: dts.inline
        ? false
        : {
            resolve: ['@fastkit/plugboy'],
          },
      treeshake: true,
      esbuildPlugins,
      entry,
      splitting: true,
      outExtension: ({ format }) => ({
        js: `.mjs`,
      }),
      sourcemap: true,
      clean: true,
      ...overrides,
    };

    for (const opt of TSUP_SYNC_OPTIONS) {
      _tsupOptions[opt] = this.workspace.config[opt] as any;
    }

    const PLUGBOY_VAR_ENVS: Record<EnvVarName, string> = {
      __PLUGBOY_DEV__: 'false',
      __PLUGBOY_STUB__: 'false',
    };

    const DEFINE_VAR_INJECTS = Object.fromEntries(
      Object.keys(PLUGBOY_VAR_ENVS).map((envName) => [envName, `$$${envName}`]),
    );

    _tsupOptions.define = {
      ..._tsupOptions.define,
      ...DEFINE_VAR_INJECTS,
    };

    const PLUGBOY_VAR_ENVS_BANNER = [
      ...Object.entries(PLUGBOY_VAR_ENVS).map(
        ([envName, variable]) =>
          `const $$${envName} = /* @PLUGBOY:${envName}:start */${variable}/* @PLUGBOY:${envName}:end */;`,
      ),
      `const $$__PLUGBOY_RELATIVE_PATH_FOR_WORKSPACE__ = '@@__PLUGBOY_RELATIVE_PATH_FOR_WORKSPACE__';`,
    ].join('\n');

    const ENV_FN_INJECTS = `
import __plugboy_path from 'node:path';
import { fileURLToPath as __plugboy_fileURLToPath } from 'node:url';

function __plugboyFilename() {
  return __plugboy_fileURLToPath(import.meta.url);
}

function __plugboyDirname() {
  return __plugboy_path.dirname(__plugboyFilename());
}

function __plugboyWorkspaceDir(...paths) {
  return __plugboy_path.join(__plugboy_path.resolve(__plugboyDirname(), $$__PLUGBOY_RELATIVE_PATH_FOR_WORKSPACE__), ...paths);
}

function __plugboySrcDir(...paths) {
  return __plugboy_path.join(__plugboyWorkspaceDir(), 'src', ...paths);
}

function __plugboyPublicDir(...paths) {
  return __plugboy_path.join(__plugboyWorkspaceDir(), 'dist', ...paths);
}
    `.trim();

    const banner: NonNullable<Options['banner']> = { ..._tsupOptions.banner };
    banner.js = `${
      banner.js ? banner.js + '\n\n' : ''
    }${PLUGBOY_VAR_ENVS_BANNER}\n\n${ENV_FN_INJECTS}`;

    _tsupOptions.banner = banner;

    _tsupOptions.external = _tsupOptions.external || [];
    _tsupOptions.external.push(
      /^(@fastkit\/)?plugboy/,
      ...this.workspace.dependencies,
    );

    this._tsupOptions = _tsupOptions;

    return _tsupOptions;
  }

  private async _stubLinkJS(from: string, to: string) {
    const fromParsed = path.parse(from);
    const fromDir = fromParsed.dir;
    const toParsed = path.parse(to);
    const toRelativeDir = path.relative(fromDir, toParsed.dir);
    const location = path.join(toRelativeDir, toParsed.base);
    const source = await fs.readFile(to, 'utf-8');
    const shebang = source.match(SHEBANG_MATCH_RE)?.[1];
    const STUB_FN_ERROR = `() => { throw new Error('Path resolution methods cannot be executed in stub mode.') }`;
    const PLUGBOY_ENVS: Record<EnvVarName | EnvFnName, string> = {
      __PLUGBOY_DEV__: 'true',
      __PLUGBOY_STUB__: 'true',
      __plugboyWorkspaceDir: STUB_FN_ERROR,
      __plugboySrcDir: STUB_FN_ERROR,
      __plugboyPublicDir: STUB_FN_ERROR,
      // __plugboyWorkspaceDir: `(...paths) => path.join('${this.workspace.dir.value}', ...paths)`,
      // __plugboySrcDir: `(...paths) => path.join(__plugboySrcDir(), 'src', ...paths)`,
      // __plugboyPublicDir: `(...paths) => path.join(__plugboySrcDir(), 'dist', ...paths)`,
    };
    const ENV_INJECTS = Object.entries(PLUGBOY_ENVS)
      .map(([envName, variable]) => `globalThis.${envName} = ${variable};`)
      .join('\n');
    const disableChecks = '/* eslint-disable */\n// @ts-nocheck\n';
    const code = `${disableChecks}${ENV_INJECTS}\nexport * from '${location}';`;
    const dtsPath = path.join(fromDir, `${fromParsed.name}.d.ts`);
    const dtsCode = `${disableChecks}export * from '${location.replace(
      /\.ts$/,
      '',
    )}';`;
    await Promise.all([
      fs.writeFile(from, `${shebang ? shebang + '\n' : ''}${code}`),
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
        } else if (link.type === 'css') {
          return this._stubLinkCSS(link.from);
        }
      }),
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
    const { preserveType } = this.dts;
    let normalized = dts;
    let processed = false;
    for (const settings of preserveType) {
      const _normalized = this.normalizeDTSBySettings(normalized, settings);
      if (_normalized) {
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

  async emitInlineDTS() {
    const { dir, dirs, exports } = this.workspace;
    const cwd = dir.value;
    const outDir = dirs.dist.join('.dts-generate').value;
    const dtsSrcDir = path.join(outDir, 'src');
    const dtsDest = dirs.dist.join('.dts').value;

    await emitDTS({
      cwd,
      outDir,
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
          path.basename(at.dtsDest).replace(/\.d\.ts$/, ''),
        );
        const code = `export * from './${relativePath}';`;
        await fs.writeFile(at.types, code, 'utf-8');
      }),
    );

    const dtsFiles = await glob(path.join(dtsDest, '**/*.d.ts'));
    await this.normalizeDTSFiles(dtsFiles);
  }

  async build() {
    const _outputFiles: OutputFile[] = [];
    const options = await this.tsupOptions();
    await build({
      ...options,
      esbuildPlugins: [
        ...options.esbuildPlugins,
        {
          name: 'output-collection',
          setup(build) {
            build.onEnd((result) => {
              const { outputFiles } = result;
              if (!outputFiles) return;
              _outputFiles.push(...outputFiles);
            });
          },
        },
      ],
      onSuccess: async () => {
        const emptyNativeNodeModuleRe = /(^|\n)import 'node:.+?';?/g;
        await Promise.all(
          _outputFiles.map(async ({ path: filePath }) => {
            if (!filePath.endsWith('.mjs')) return;
            const code = await fs.readFile(filePath, 'utf-8');
            const replaced = code.replace(emptyNativeNodeModuleRe, '');
            if (code === replaced) return;

            await fs.writeFile(filePath, replaced.trimStart(), 'utf-8');
          }),
        );

        await this.workspace.hooks.onSuccess(this, _outputFiles);
      },
    });

    if (this.dts.inline) {
      await this.emitInlineDTS();
    } else {
      await this.normalizeDTSFiles();
    }
  }
}
