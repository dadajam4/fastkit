#!/usr/bin/env node

const [, , ...args] = process.argv;
const options = {};
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  const nextArg = args[i + 1];
  if (arg.startsWith('--')) {
    options[arg.replace('--', '')] =
      !nextArg || nextArg.startsWith('--') ? true : nextArg;
  }
}
const [_command] = args;
let command = _command;
if (command === undefined || command.startsWith('-')) {
  command = 'dev';
}

const availableCommands = ['dev', 'build', 'generate', 'serve'];

if (!availableCommands.includes(command)) {
  throw new Error(`Command "${command}" not supported`);
}

async function main() {
  if (['build', 'preview'].includes(command)) {
    await import('./build.mjs');
  }

  if (command === 'generate') {
    await import('./generate.mjs');
  }

  if (['serve', 'preview'].includes(command)) {
    await import('./serve.mjs');
  }

  if (command === 'dev') {
    await import('./dev.mjs');
  }
}

main();
