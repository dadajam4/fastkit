/**
 * Child-process driver for the stylesheet-name build integration test.
 *
 * Builds the fixture like `plugboy-build-driver.mts`, then writes the
 * stylesheets the workspace *declares* — the `./<entry>.css` exports plugboy
 * publishes — to `declared-stylesheets.json` beside the package.
 *
 * The assertion under test is that the emitted stylesheet is named after the
 * entry plugboy declared, so both halves have to be observable. `builder.build()`
 * does not rewrite the fixture's `package.json` (that is the CLI's `gen` step),
 * which is why the declared side is reported from the workspace instead of being
 * read back off disk.
 *
 * Usage: `tsx plugboy-css-name-driver.mts <dir>`.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkspace } from '../../../plugboy/src/workspace';

const dir = process.argv[2];
if (dir) process.chdir(dir);

const workspace = await getWorkspace();
await workspace.builder.build();

const declared = workspace.exports
  .filter((exp) => exp.id.endsWith('.css'))
  .map((exp) => ({ id: exp.id, at: exp.at }));

await fs.writeFile(
  path.join(process.cwd(), 'declared-stylesheets.json'),
  JSON.stringify(declared, null, 2),
);
