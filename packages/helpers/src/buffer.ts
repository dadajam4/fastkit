/** Does the Buffer class exist in the Global space? */
const HAS_BUFFER = typeof Buffer !== 'undefined';

/** Does the ArrayBuffer class exist in the Global space? */
const HAS_ARRAY_BUFFER = typeof ArrayBuffer !== 'undefined';

/**
 * Check if the argument value is a Buffer instance
 * @param source - Value to be checked
 * @returns true if it is a Buffer instance
 */
export function isBuffer<T extends Uint8Array = Uint8Array>(
  source: unknown,
): source is T {
  return HAS_BUFFER && source instanceof Buffer;
}

/**
 * Check if the argument value is a ArrayBufferView instance
 * @param source - Value to be checked
 * @returns true if it is a ArrayBufferView instance
 */
export function isArrayBufferView(source: unknown): source is ArrayBufferView {
  return HAS_ARRAY_BUFFER && ArrayBuffer.isView(source);
}

/**
 * Copy the bytes a view spans into a newly allocated `ArrayBuffer`
 *
 * @param cur - View to copy from
 * @returns A view over the new `ArrayBuffer`, sharing no memory with `cur`
 *
 * @remarks
 * Returns a Node `Buffer` where the global exists, and a plain `Uint8Array`
 * otherwise -- `Buffer` extends `Uint8Array`, so the declared return type
 * covers both. The Node branch used to run unconditionally, which threw
 * `ReferenceError: Buffer is not defined` in a browser (issue #252).
 */
export function copyBuffer(cur: Uint8Array | ArrayBufferView): Uint8Array {
  const bytes = cur.buffer.slice(
    cur.byteOffset,
    cur.byteOffset + cur.byteLength,
  );
  return HAS_BUFFER ? Buffer.from(bytes) : new Uint8Array(bytes);
}
