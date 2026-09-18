import { describe, test, expect } from 'vitest';
import { isBuffer, isArrayBufferView, copyBuffer } from '../buffer';

describe('buffer helpers, with the Buffer global present', () => {
  test('isBuffer recognises a Buffer and nothing else', () => {
    expect(isBuffer(Buffer.from([1]))).toBe(true);
    expect(isBuffer(new Uint8Array([1]))).toBe(false);
    expect(isBuffer('not a buffer')).toBe(false);
    expect(isBuffer(undefined)).toBe(false);
  });

  test('isArrayBufferView covers both', () => {
    expect(isArrayBufferView(Buffer.from([1]))).toBe(true);
    expect(isArrayBufferView(new Uint8Array([1]))).toBe(true);
    expect(isArrayBufferView(new ArrayBuffer(1))).toBe(false);
  });

  test('copyBuffer returns an independent copy', () => {
    const source = new Uint8Array([1, 2, 3]);
    const copy = copyBuffer(source);
    expect([...copy]).toEqual([1, 2, 3]);
    expect(copy.buffer).not.toBe(source.buffer);
    copy[0] = 9;
    expect(source[0]).toBe(1);
  });

  test('copyBuffer honours a view that starts partway into its buffer', () => {
    // A pooled `Buffer` is the real-world case: `byteOffset` is rarely 0.
    const view = Buffer.from([9, 8, 7, 6, 5]).subarray(1, 4);
    expect([...copyBuffer(view)]).toEqual([8, 7, 6]);
  });

  test('copyBuffer still produces a Buffer where one exists', () => {
    expect(Buffer.isBuffer(copyBuffer(new Uint8Array([1])))).toBe(true);
  });
});
