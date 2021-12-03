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

const avairableCommands = ['dev', 'build', 'serve'];

if (!avairableCommands.includes(command)) {
  throw new Error(`Command "${command}" not supported`);
}

async function main() {
  if (['build', 'preview'].includes(command)) {
    require('./build');
  }

  if (['serve', 'preview'].includes(command)) {
    require('./serve');
  }

  if (command === 'dev') {
    require('./dev');
  }
}

main();
