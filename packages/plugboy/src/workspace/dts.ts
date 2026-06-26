import { execa } from 'execa';
import path from 'node:path';
import type { DTSCompilerOption, EmitDTSOptions } from '../types/dts';
import type { PlugboyWorkspace } from './workspace';

export interface EmitDTSFullOptions extends EmitDTSOptions {
  workspace: PlugboyWorkspace;
  compiler?: DTSCompilerOption;
  ignoreCompilerErrors?: boolean;
}
// export interface EmitDTSOptions {
//   cwd?: string;
//   outDir?: string;
// }

export async function runTsc(
  compiler: 'tsc' | 'vue-tsc',
  opts: EmitDTSOptions = {},
  ignoreErrors?: boolean,
) {
  const { cwd = process.cwd(), outDir = path.join(cwd, 'dist/dts') } = opts;

  try {
    await execa(
      compiler,
      [
        '--declaration true',
        '--skipLibCheck',
        '--noEmit false',
        '--emitDeclarationOnly',
        `--outDir ${outDir}`,
      ],
      { cwd, shell: true, stdio: 'inherit' },
    );
  } catch (e) {
    if (!ignoreErrors) throw e;
    // eslint-disable-next-line no-console
    console.log(
      `Note: ${compiler} reported errors, but continuing with generated files...`,
    );
  }
}

/**
 * Emit DTS (declaration files)
 */
export async function emitDTS(opts: EmitDTSFullOptions) {
  const {
    compiler = 'tsc',
    ignoreCompilerErrors = false,
    workspace,
    ...baseOpts
  } = opts;

  if (typeof compiler === 'function') {
    // Custom compiler function
    await compiler({ ...baseOpts, workspace });
  } else {
    await runTsc(compiler, { ...baseOpts }, ignoreCompilerErrors);
  }
}
