export async function createMemwatch() {
  const { getGc } = await import('./expose-gc.mjs');
  const gc = getGc();

  let memwatcher;
  let memwatch;

  try {
    memwatcher = await import('node-memwatcher');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.warn('For memory monitoring, "node-memwatcher" is required.');
      process.exit(1);
    } else {
      throw err;
    }
  }

  try {
    memwatch = await import('@airbnb/node-memwatch');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.warn(
        'For memory monitoring, "@airbnb/node-memwatch" is required.',
      );
      process.exit(1);
    } else {
      throw err;
    }
  }

  const log = console.log;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const mockLogger = function () {};

  console.log = mockLogger;
  console.warn = mockLogger;
  // console.error = mockLogger;

  let hd = new memwatch.HeapDiff();

  return {
    log,
    gc,
    memwatcher,
    memwatch,
    diff: () => {
      const diff = hd.end();
      hd = new memwatch.HeapDiff();
      const suspicious = diff.change.details.filter((row) => row['+'] > 0);
      suspicious.sort((a, b) => {
        const ap = a['+'];
        const bp = b['+'];
        if (ap > bp) return -1;
        if (ap < bp) return 1;
        return 0;
      });

      return {
        ...diff,
        suspicious,
      };
    },
  };
}
