import { execa } from 'execa';
import path from 'node:path';

export interface EmitDTSOptions {
  cwd?: string;
  outDir?: string;
}

export async function emitDTS(opts: EmitDTSOptions = {}) {
  const { cwd = process.cwd(), outDir = path.join(cwd, 'dist/dts') } = opts;
  await execa(
    'tsc',
    [
      '--declaration true',
      '--skipLibCheck',
      '--noEmit false',
      '--emitDeclarationOnly',
      `--outDir ${outDir}`,
    ],
    { cwd, shell: true, stdio: 'inherit' },
  );
}
