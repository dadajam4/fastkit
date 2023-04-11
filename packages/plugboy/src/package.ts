import { ProjectPackageJson, WorkspacePackageJson } from './types';
import {
  findConfig,
  isProjectPackageJson,
  isWorkspacePackageJson,
} from './utils';
import { PACKAGE_JSON_FILENAME } from './constants';
import { Path } from './path';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface GetProjectPackageJsonResult {
  dir: Path;
  json: ProjectPackageJson;
}

export async function getProjectPackageJson<
  AllowMissing extends boolean | undefined = false,
>(
  searchDir?: string,
  allowMissing?: AllowMissing,
): Promise<
  AllowMissing extends true
    ? GetProjectPackageJsonResult | null
    : GetProjectPackageJsonResult
> {
  const hit = await findConfig(
    {
      fileName: PACKAGE_JSON_FILENAME,
      allowMissing,
      test: (result) => isProjectPackageJson(JSON.parse(result.code)),
    },
    searchDir,
  );
  if (!hit) {
    if (allowMissing) return null as any;
    throw new Error('missing project package.');
  }
  return {
    dir: new Path(hit.dir),
    json: JSON.parse(hit.code),
  } as any;
}

export interface GetWorkspacePackageJsonResult {
  dir: Path;
  json: WorkspacePackageJson;
}

export async function getWorkspacePackageJson<
  AllowMissing extends boolean | undefined = false,
>(
  searchDir?: string,
  allowMissing?: AllowMissing,
): Promise<
  AllowMissing extends true
    ? GetWorkspacePackageJsonResult | null
    : GetWorkspacePackageJsonResult
> {
  const hit = await findConfig(
    {
      fileName: PACKAGE_JSON_FILENAME,
      allowMissing,
      test: (result) => isWorkspacePackageJson(JSON.parse(result.code)),
    },
    searchDir,
  );
  if (!hit) {
    if (allowMissing) return null as any;
    throw new Error('missing workspace package.');
  }
  return {
    dir: new Path(hit.dir),
    json: JSON.parse(hit.code),
  } as any;
}

export async function findWorkspacePackages(
  dir: string,
): Promise<GetWorkspacePackageJsonResult[]> {
  const results: GetWorkspacePackageJsonResult[] = [];
  const searchDir = path.resolve(dir);
  const dirs = await fs.readdir(searchDir);
  const pkgs = await Promise.all(
    dirs.map((dirName) =>
      getWorkspacePackageJson(path.join(searchDir, dirName), true),
    ),
  );
  pkgs.forEach((pkg) => {
    pkg && results.push(pkg);
  });
  return results;
}
