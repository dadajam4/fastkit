import { describe, test, expect, beforeAll } from 'vitest';

/**
 * The Buffer global is read once, when the module is evaluated, so a browser
 * has to be simulated before the import rather than inside a test -- hence a
 * file of its own.
 *
 * `copyBuffer` used to call `Buffer.from` unconditionally, which threw
 * `ReferenceError: Buffer is not defined` anywhere the global is absent, and
 * `@fastkit/cloner` calls it for every `ArrayBufferView` it clones (issue #252).
 */
let buffer: typeof import('../buffer');

beforeAll(async () => {
  Reflect.deleteProperty(globalThis, 'Buffer');
  buffer = await import('../buffer');
});

describe('buffer helpers, with no Buffer global', () => {
  test('the global really is gone', () => {
    expect(typeof (globalThis as any).Buffer).toBe('undefined');
  });

  test('isBuffer answers false instead of throwing', () => {
    expect(buffer.isBuffer(new Uint8Array([1]))).toBe(false);
  });

  test('copyBuffer copies into a plain Uint8Array', () => {
    const source = new Uint8Array([1, 2, 3]);
    const copy = buffer.copyBuffer(source);
    expect(copy).toBeInstanceOf(Uint8Array);
    expect([...copy]).toEqual([1, 2, 3]);
    expect(copy.buffer).not.toBe(source.buffer);
  });
});
