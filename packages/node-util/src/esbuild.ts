import esbuild, { Plugin } from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import chokidar, { type FSWatcher } from 'chokidar';
import { EV } from '@fastkit/ev';
import module from 'node:module';
import url from 'node:url';
import { NodeUtilError } from './logger';
import { findPackageDir } from './package';
import { resolveEntryPoint, pathExists } from './path';

const require = module.createRequire(import.meta.url);

const jsFileLocationPlugin: Plugin = {
  name: 'js-file-location',
  setup({ onLoad }) {
    const createRE = (name: string) =>
      new RegExp(`(?<!\\.|'|"|var |let |const )__${name}`, 'g');

    const filenameMatchRE = createRE('filename');
    const dirnameMatchRE = createRE('dirname');

    const isWindows = /^win/.test(process.platform);
    const esc = (p: string) => (isWindows ? p.replace(/\\/g, '/') : p);

    onLoad({ filter: /\.((m|c)?(j|t)sx?)$/, namespace: 'file' }, (args) => {
      let code = fs.readFileSync(args.path, 'utf8');

      const fileURL = url.pathToFileURL(args.path);
      const filename = esc(args.path);
      const dirname = esc(path.dirname(args.path));

      code = code
        .replace(/\bimport\.meta\.url\b/g, JSON.stringify(fileURL))
        .replace(filenameMatchRE, JSON.stringify(filename))
        .replace(dirnameMatchRE, JSON.stringify(dirname));

      const chunks = args.path.split('.');
      const ext = chunks[chunks.length - 1];

      const jsType = ext.includes('ts') ? 'ts' : 'js';
      const jsxSuffix = ext.includes('sx') ? 'x' : '';
      const loader = `${jsType}${jsxSuffix}` as const;

      return { contents: code, loader };
    });
  },
};

const nativeNodeModulesPlugin: Plugin = {
  name: 'native-node-modules',
  setup(build) {
    // If a ".node" file is imported within a module in the "file" namespace, resolve
    // it to an absolute path and put it into the "node-file" virtual namespace.
    build.onResolve({ filter: /\.node$/, namespace: 'file' }, (args) => ({
      path: require.resolve(args.path, { paths: [args.resolveDir] }),
      namespace: 'node-file',
    }));

    // Files in the "node-file" virtual namespace call "require()" on the
    // path from esbuild of the ".node" file in the output directory.
    build.onLoad({ filter: /.*/, namespace: 'node-file' }, (args) => ({
      contents: `
        import path from ${JSON.stringify(args.path)}
        try { module.exports = require(path) }
        catch {}
      `,
    }));

    // If a ".node" file is imported within a module in the "node-file" namespace, put
    // it in the "file" namespace where esbuild's default loading behavior will handle
    // it. It is already an absolute path since we resolved it to one above.
    build.onResolve({ filter: /\.node$/, namespace: 'node-file' }, (args) => ({
      path: args.path,
      namespace: 'file',
    }));

    // Tell esbuild's default loading behavior to use the "file" loader for
    // these ".node" files.
    const opts = build.initialOptions;
    opts.loader = opts.loader || {};
    opts.loader['.node'] = 'file';
  },
};

/**
 * Resolve `esbuild` to the copy this package itself uses.
 *
 * The bundle is written into the *consumer's*
 * `node_modules/.esbuild-require/` and required from there, so a bare
 * `require('esbuild')` inside it resolves from the consumer's package — which
 * has no esbuild unless it declares one, and would anyway be free to declare a
 * version other than the one that produced the bundle. Resolving to an absolute
 * path here leaves no bare specifier in the output and takes the requirement off
 * the consumer.
 *
 * The path is resolved lazily, so an entry point that never imports esbuild
 * neither pays for it nor fails on it. Subpaths (`esbuild/…`) are left to the
 * `external` option below, since esbuild's own `exports` map does not publish
 * them.
 */
const ownESbuildPlugin: Plugin = {
  name: 'own-esbuild',
  setup({ onResolve }) {
    onResolve({ filter: /^esbuild$/ }, () => ({
      path: require.resolve('esbuild'),
      external: true,
    }));
  },
};

/**
 * Directory name for an entry point's build cache.
 *
 * The name has to be unique per entry point, stable across runs, and short
 * enough to be a single path segment: most filesystems cap one at 255 bytes
 * (`NAME_MAX`). Flattening the absolute path — which is what this used to do —
 * satisfies the first two and fails the third, and a path from
 * `require.resolve()` gets there easily, since Node returns the realpath and
 * pnpm's virtual store puts a peer-dependency hash in it.
 *
 * So: the basename for the reader, and a hash of the absolute path for
 * uniqueness. Everything outside `[A-Za-z0-9_.-]` is replaced, so each
 * character is one byte and the name is at most 77 of them.
 */
function toCacheName(entryPoint: string): string {
  const readable = path
    .basename(entryPoint)
    .replace(/[^\w.-]/g, '_')
    .slice(0, 60);
  const hash = crypto
    .createHash('sha256')
    .update(entryPoint)
    .digest('hex')
    .slice(0, 16);
  return `${readable}-${hash}`;
}

export interface ESbuildRequireResult<T = any> {
  entryPoint: string;
  exports: T;
  dependencies: string[];
}

export async function findTSConfigPath(
  cwd: string = process.cwd(),
): Promise<string | undefined> {
  const target = path.join(cwd, 'tsconfig.json');
  if (await pathExists(target, 'file')) {
    return target;
  }
  const parentDir = path.join(cwd, '..');
  if (parentDir === cwd) return;
  return findTSConfigPath(parentDir);
}

export interface ESbuildRequireOptions {
  filename?: string;
  external?: string[];
}

export async function esbuildRequire<T = any>(
  rawEntryPoint: string,
  filename?: string,
): Promise<ESbuildRequireResult<T>>;

export async function esbuildRequire<T = any>(
  rawEntryPoint: string,
  options?: ESbuildRequireOptions,
): Promise<ESbuildRequireResult<T>>;

export async function esbuildRequire<T = any>(
  rawEntryPoint: string,
  filenameOrOptions: string | ESbuildRequireOptions = {},
): Promise<ESbuildRequireResult<T>> {
  const options: ESbuildRequireOptions =
    typeof filenameOrOptions === 'string'
      ? { filename: filenameOrOptions }
      : filenameOrOptions;
  let { filename } = options;
  const { external = [] } = options;
  const entryPoint = await resolveEntryPoint(rawEntryPoint);
  if (!filename) {
    const { name, ext } = path.parse(entryPoint);
    filename = name + (ext || '.js');
  } else {
    filename = path.parse(filename).base;
  }

  const pkgDir = await findPackageDir();
  if (!pkgDir) throw new NodeUtilError('missing package.');
  const tsconfig = await findTSConfigPath(pkgDir);
  const cacheName = toCacheName(entryPoint);
  const cacheDir = path.join(
    pkgDir,
    'node_modules/.esbuild-require',
    cacheName,
  );
  const outfile = path.join(cacheDir, 'index.js');

  const buildResult = await esbuild.build({
    // outfile
    entryPoints: [entryPoint],
    external: ['esbuild', ...external],
    bundle: true,
    tsconfig,
    platform: 'node',
    // write: false,
    metafile: true,
    // logLevel: 'warning',
    // external: ['module'],
    plugins: [ownESbuildPlugin, jsFileLocationPlugin, nativeNodeModulesPlugin],
    outfile,
  });

  const { metafile } = buildResult;

  let m: T | undefined;

  try {
    m = require(outfile);
  } catch (err) {
    throw err;
  }
  delete require.cache[outfile];

  const dependencies: string[] = [];

  const inputs = metafile && metafile.inputs;
  if (inputs) {
    dependencies.push(...Object.keys(inputs));
  }

  return {
    entryPoint,
    exports: m as T,
    dependencies,
  };
}

export interface ESbuildRunnerOptions<T = any> {
  entry: string;
  filename?: string;
  watch?: boolean;
  resolver?: (result: ESbuildRequireResult<any>) => T | Promise<T>;
}

interface ESbuildRunnerEntry {
  entry: string;
  filename: string;
}

export interface ESbuildRunnerEventMap<T = any> {
  build: ESbuildRequireResult<T>;
}

export class ESbuildRunner<T = any> extends EV<ESbuildRunnerEventMap<T>> {
  readonly rawEntry: string;

  readonly entry?: string;

  readonly filename?: string;

  private watcher: FSWatcher | null = null;

  private _dependencies: string[] = [];

  private _filteredDependencies: string[] = [];

  private _watch: boolean;

  private _resolver?: (result: ESbuildRequireResult<any>) => T | Promise<T>;

  get watch() {
    return this._watch;
  }

  get dependencies() {
    return this._dependencies;
  }

  get filteredDependencies() {
    return this._filteredDependencies;
  }

  constructor(opts: ESbuildRunnerOptions) {
    super();

    const { entry, filename, watch = false, resolver } = opts;
    this.rawEntry = entry;
    this.filename = filename;
    this._watch = watch;
    this._resolver = resolver;
    this.handleChangeDependencies = this.handleChangeDependencies.bind(this);
  }

  run() {
    return this.build();
  }

  async getEntry(): Promise<ESbuildRunnerEntry> {
    let { entry, filename } = this;
    if (!entry) {
      entry = await resolveEntryPoint(this.rawEntry);
    }
    if (!filename) {
      const { name, ext } = path.parse(entry);
      filename = name + (ext || '.js');
    } else {
      filename = path.parse(filename).base;
    }

    return {
      entry,
      filename,
    };
  }

  private closeWatcher() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  private setDependencies(dependencies: string[]) {
    this._dependencies = [...dependencies];
    const watcherIgnoreRe = /^(node_modules|node-file:)/;
    const filteredDependencies = dependencies.filter(
      (d) => !watcherIgnoreRe.test(d),
    );
    this._filteredDependencies = filteredDependencies;
    this.closeWatcher();
    if (this.watch && filteredDependencies.length) {
      this.watcher = chokidar
        .watch(filteredDependencies)
        .on('change', this.handleChangeDependencies);
    }
  }

  private handleChangeDependencies(_path: string, _stats?: fs.Stats) {
    this.build();
  }

  async build() {
    const { entry, filename } = await this.getEntry();
    const result = await esbuildRequire<T>(entry, filename);
    this.setDependencies(result.dependencies);

    const { _resolver } = this;
    if (_resolver) {
      result.exports = await _resolver(result);
    }

    this.emit('build', result);
    return result;
  }

  dispose() {
    this.closeWatcher();
    this.offAll();
  }
}
