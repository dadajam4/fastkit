import fs from 'node:fs';
import path from 'node:path';
import { runnerImport, type InlineConfig } from 'vite';
import {
  resolveVotServerDefinition,
  VotServerConfig,
  VotServerContext,
  VotServerDefinition,
} from '../schema/server';

/**
 * Basename looked up at the project root when
 * `votPlugin({ server: { entry } })` is not set.
 */
export const DEFAULT_SERVER_ENTRY_BASENAME = 'vot.server';

const SERVER_ENTRY_EXTENSIONS = ['ts', 'mts', 'js', 'mjs'];

/**
 * Filename the server entry is bundled to inside `dist/server`.
 */
export const SERVER_ENTRY_OUTPUT = 'vot.server.js';

/**
 * Locate the project's server entry.
 *
 * An explicit `entry` is required to exist -- a typo there should fail loudly
 * rather than fall back to loading `vite.config.ts` at runtime.
 */
export function resolveServerEntryPath(
  root: string,
  entry?: string,
): string | undefined {
  if (entry) {
    const resolved = path.resolve(root, entry);
    if (!fs.existsSync(resolved)) {
      throw new Error(`missing vot server entry: ${resolved}`);
    }
    return resolved;
  }

  for (const ext of SERVER_ENTRY_EXTENSIONS) {
    const candidate = path.join(
      root,
      `${DEFAULT_SERVER_ENTRY_BASENAME}.${ext}`,
    );
    if (fs.existsSync(candidate)) return candidate;
  }
}

/**
 * Evaluate the server entry from source.
 *
 * Used by `vot dev`, where no bundled artifact exists yet. `runnerImport()`
 * runs the file through Vite's module runner with `configFile: false`, so
 * loading it from inside the `config()` hook cannot recurse into
 * `vite.config.ts`.
 */
export async function loadServerEntry(
  file: string,
  ctx: VotServerContext,
  inlineConfig?: InlineConfig,
): Promise<VotServerConfig> {
  const { module } = await runnerImport<{ default?: VotServerDefinition }>(
    file,
    inlineConfig,
  );

  const definition = module.default;

  if (!definition) {
    throw new Error(
      `the vot server entry "${file}" has no default export. Export the result of \`defineVotServer()\`.`,
    );
  }

  return resolveVotServerDefinition(definition, ctx);
}
