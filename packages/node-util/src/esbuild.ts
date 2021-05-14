import esbuild from 'esbuild';
import path from 'path';
import Module from 'module';
import { resolveEntryPoint, findPackageDir } from './path';
import { NodeUtilError } from './logger';

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
  const buildResult = await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    tsconfig,
    platform: 'node',
    write: false,
    metafile: true,
    logLevel: 'info',
  });
  const { outputFiles, metafile } = buildResult;
  const code = outputFiles[0].text;
  const m = new Module(entryPoint, require.main);
  (m as any)._compile(code, filename);
  const dependencies: string[] = [];

  const inputs = metafile && metafile.inputs;
  if (inputs) {
    dependencies.push(...Object.keys(inputs));
  }

  return {
    entryPoint,
    exports: m.exports as T,
    dependencies,
  };
}
