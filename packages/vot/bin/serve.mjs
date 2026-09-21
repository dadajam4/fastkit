import { serve } from '../dist/internal/serve.mjs';

const served = await serve();

/**
 * Shut down on the signals an orchestrator actually sends.
 *
 * This lives in the bin rather than in `serve()` because `serve()` is a library
 * function -- something that embeds it owns its own process, and a library that
 * installs signal handlers behind the caller's back takes that away. A CLI
 * entry point is where process-level concerns belong.
 *
 * `vot dev` deliberately has no equivalent: Vite's dev server installs its own
 * `SIGTERM` handler whenever it is not in middleware mode, and a second one
 * here would race it to `process.exit()`.
 */
let closing = false;

const shutdown = async (signal) => {
  if (closing) return;
  closing = true;

  try {
    await served.close();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  } finally {
    // The shell convention for "terminated by this signal".
    process.exit(process.exitCode ?? (signal === 'SIGINT' ? 130 : 143));
  }
};

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}
