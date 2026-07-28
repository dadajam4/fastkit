---
"@fastkit/node-util": patch
"@fastkit/plugboy": patch
---

Update `execa` from 9.x to 10.x.

No code changes were needed. Every call site uses the plain `execa(file, args, options)` form and only awaits the result or reads `stdout` / `stderr`, so none of execa 10's removals apply — `execaCommand()` / `execaCommandSync()`, the `stdio: [..., 'ipc']` syntax, and the `ChildProcess` methods that moved behind `subprocess.nodeChildProcess` are all unused, as is the `input` / `inputFile` behaviour change.

Both packages are bumped together so a single execa major is installed rather than two side by side.
