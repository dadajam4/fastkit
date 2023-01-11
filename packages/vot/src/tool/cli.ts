// import { build } from './build';

export async function cli() {
  if (!(globalThis as any).__ssr_start_time) {
    const { performance } = await import('node:perf_hooks');

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.__ssr_start_time = performance.now();
  }

  const [, , ...args] = process.argv;

  const options = {} as Record<string, any>;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    if (arg.startsWith('--')) {
      options[arg.replace('--', '')] =
        !nextArg || nextArg.startsWith('--') ? true : nextArg;
    }
  }

  const [command] = args;

  if (command === 'build') {
    const { build } = await import('./build');

    (async () => {
      const { mode, ssr, watch } = options;

      await build({
        clientOptions: { mode, build: { watch } },
        serverOptions: { mode, build: { ssr } },
      });

      if (!watch) {
        process.exit();
      }
    })();
  } else if (command === 'generate') {
    const { generate } = await import('./generate');
    await generate();
    process.exit();
  } else if (
    command === 'dev' ||
    command === undefined ||
    command.startsWith('-')
  ) {
    const { startServer } = await import('./dev');
    startServer(options);
  } else {
    console.log(`Command "${command}" not supported`);
  }
}
