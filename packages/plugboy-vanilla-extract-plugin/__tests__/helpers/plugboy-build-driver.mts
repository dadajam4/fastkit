/**
 * Child-process driver for the CSS-target build integration test.
 *
 * Run via `tsx` in a fresh process whose cwd is the fixture package:
 * `tsx plugboy-build-driver.mts <dir>`.
 *
 * plugboy is imported from its *source* (not the `@fastkit/plugboy` package
 * entry) so the test never depends on that package's `dist` being built —
 * turbo's `test` task does not depend on `build`.
 */
import { getWorkspace } from '../../../plugboy/src/workspace';

const dir = process.argv[2];
if (dir) process.chdir(dir);

const workspace = await getWorkspace();
await workspace.builder.build();
