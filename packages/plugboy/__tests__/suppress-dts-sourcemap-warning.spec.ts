import { describe, test, expect, vi } from 'vitest';
import { createSuppressDtsSourcemapWarningPlugin } from '../src/workspace/plugins/suppress-dts-sourcemap-warning';

type OnLog = (
  this: { debug: (log: unknown) => void },
  level: string,
  log: Record<string, unknown>,
) => boolean | undefined | null | void;

function setup() {
  const plugin = createSuppressDtsSourcemapWarningPlugin();
  const debug = vi.fn();
  const onLog = plugin.onLog as unknown as OnLog;
  const call = (level: string, log: Record<string, unknown>) =>
    onLog.call({ debug }, level, log);
  return { plugin, debug, call };
}

const FAKE_JS = 'rolldown-plugin-dts:fake-js';

describe('createSuppressDtsSourcemapWarningPlugin', () => {
  test('suppresses the fake-js SOURCEMAP_BROKEN warning and traces it at debug level', () => {
    const { call, debug } = setup();
    const result = call('warn', {
      code: 'SOURCEMAP_BROKEN',
      plugin: FAKE_JS,
      message: 'Sourcemap is likely to be incorrect',
    });
    expect(result).toBe(false);
    expect(debug).toHaveBeenCalledTimes(1);
  });

  test('does NOT suppress SOURCEMAP_BROKEN from a different plugin (real JS breakage)', () => {
    const { call, debug } = setup();
    const result = call('warn', {
      code: 'SOURCEMAP_BROKEN',
      plugin: 'some-other-plugin',
      message: 'Sourcemap is likely to be incorrect',
    });
    expect(result).toBeUndefined();
    expect(debug).not.toHaveBeenCalled();
  });

  test('does NOT suppress SOURCEMAP_BROKEN without a plugin attribution', () => {
    const { call } = setup();
    expect(
      call('warn', { code: 'SOURCEMAP_BROKEN', message: 'x' }),
    ).toBeUndefined();
  });

  test('does NOT suppress other warning codes from fake-js', () => {
    const { call } = setup();
    expect(
      call('warn', { code: 'CIRCULAR_DEPENDENCY', plugin: FAKE_JS }),
    ).toBeUndefined();
  });

  test('only acts on warn level, not info/debug', () => {
    const { call } = setup();
    expect(
      call('info', { code: 'SOURCEMAP_BROKEN', plugin: FAKE_JS }),
    ).toBeUndefined();
  });

  test('is log-only: defines no output-affecting hooks (guarantees byte-identical output)', () => {
    const { plugin } = setup();
    // Only `name` and `onLog` — no transform/renderChunk/generateBundle/etc.,
    // so the plugin cannot alter build output.
    expect(Object.keys(plugin).sort()).toEqual(['name', 'onLog']);
  });
});
