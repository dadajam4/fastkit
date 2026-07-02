/**
 * Child-process driver for the external-imports build integration test.
 *
 * Run via `tsx` in a fresh process whose cwd is the fixture package, so that
 * rolldown's native diagnostics (written directly to the process's stdout/
 * stderr file descriptors, bypassing JS `process.stdout.write`) can be captured
 * by the parent at the OS level. Usage: `tsx plugboy-build-driver.mts <dir>`.
 */
import { getWorkspace } from '../../src/workspace';

const dir = process.argv[2];
if (dir) process.chdir(dir);

const workspace = await getWorkspace();
await workspace.builder.build();
