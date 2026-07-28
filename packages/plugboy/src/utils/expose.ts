import path from 'node:path';
import { glob } from 'glob';
import { RawWorkspaceEntryObject } from '../types';

export interface ExposeEntriesSettings {
  dir: string;
  /**
   * Path prefix at distribution
   */
  prefix?: string;
}

export type RawExposeEntriesSettings = string | ExposeEntriesSettings;

export function resolveRawExposeEntriesSettings(
  rawSettings: RawExposeEntriesSettings,
): ExposeEntriesSettings {
  return typeof rawSettings === 'string' ? { dir: rawSettings } : rawSettings;
}

const TRIM_PATH_RE = /(^\.?\/|\/$)/g;
const TRIM_EXT_RE = /\.ts$/;

export async function exposeEntries(rawSettings: RawExposeEntriesSettings) {
  const { dir: _dir, prefix: _prefix } =
    resolveRawExposeEntriesSettings(rawSettings);
  const dir = path.resolve(_dir);
  const prefix = _prefix ? _prefix.replace(TRIM_PATH_RE, '') : '';
  const pattern = path.join(dir, '**/*.ts');
  // `glob` makes no ordering guarantee, and the insertion order here becomes the
  // key order of the generated `exports` / `typesVersions`, so an unsorted result
  // rewrites the workspace's package.json on an arbitrary subset of builds.
  const files = (await glob(pattern)).sort();
  const entries: Record<string, RawWorkspaceEntryObject> = {};
  for (const file of files) {
    const id = (prefix + file.replace(dir, ''))
      .replace(TRIM_EXT_RE, '')
      .replace(TRIM_PATH_RE, '');
    entries[id] = {
      src: file,
    };
  }
  return entries;
}
