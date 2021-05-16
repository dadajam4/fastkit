import esbuild, { Plugin } from 'esbuild';
import path from 'path';
// import Module from 'module';
import { resolveEntryPoint, findPackageDir } from './path';
import { NodeUtilError } from './logger';

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

export async function esbuildRequire<T = any>(
  rawEntryPoint: string,
  filename?: string,
): Promise<{
  entryPoint: string;
  exports: T;
  dependencies: string[];
}> {
  const entryPoint = await resolveEntryPoint(rawEntryPoint);
  if (!filename) {
    const { name, ext } = path.parse(entryPoint);
    filename = name + (ext || '.js');
  } else {
    filename = path.parse(filename).base;
  }

  const pkgDir = await findPackageDir();
  if (!pkgDir) throw new NodeUtilError('missing package.');
  const tsconfig = path.join(pkgDir, 'tsconfig.json');
  const cacheName = entryPoint.replace(/\//g, '_');
  const cacheDir = path.join(
    pkgDir,
    'node_modules/.esbuild-require',
    cacheName,
  );
  const outfile = path.join(cacheDir, 'index.js');
  const buildResult = await esbuild.build({
    // outfile
    entryPoints: [entryPoint],
    bundle: true,
    tsconfig,
    platform: 'node',
    // write: false,
    metafile: true,
    // logLevel: 'warning',
    // external: ['module'],
    plugins: [nativeNodeModulesPlugin],
    outfile,
  });

  const { metafile } = buildResult;

  let m: T | undefined = undefined;

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
