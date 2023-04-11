/** Does the Buffer class exist in the Global space? */
const HAS_BUFFER = typeof Buffer !== 'undefined';

/** Does the ArrayBuffer class exist in the Global space? */
const HAS_ARRAY_BUFFER = typeof ArrayBuffer !== 'undefined';

/**
 * Check if the argument value is a Buffer instance
 * @param source - Value to be checked
 * @returns true if it is a Buffer instance
 */
export function isBuffer(source: unknown): source is Buffer {
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
 * Buffer, and duplicate the ArrayBufferView to get a new Buffer
 * @param cur - Buffer from which to duplicate
 * @returns Copied buffer
 */
export function copyBuffer(cur: Buffer | ArrayBufferView) {
  if (isBuffer(cur)) {
    return Buffer.from(cur);
  }
  return Buffer.from(cur.buffer.slice(0), cur.byteOffset, cur.byteLength);
}
