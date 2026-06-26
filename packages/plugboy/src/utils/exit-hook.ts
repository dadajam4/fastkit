const EXIT_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;

type ExitHandler = () => void;

const _callbacks: ExitHandler[] = [];

export function exitHook(cb: ExitHandler): () => void {
  _callbacks.push(cb);
  const off = () => {
    const index = _callbacks.indexOf(cb);
    if (index !== -1) {
      _callbacks.splice(index, 1);
    }
  };
  return off;
}

for (const signal of EXIT_SIGNALS) {
  process.on(signal, async () => {
    const callbacks = _callbacks.slice();
    _callbacks.length = 0;
    try {
      await Promise.all(callbacks.map((cb) => cb()));
      process.exit(0);
    } catch (_err) {
      // eslint-disable-next-line no-console
      console.error(_err);
      process.exit(1);
    }
  });
}
