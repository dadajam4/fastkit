const HAS_BUFFER = typeof Buffer !== 'undefined';
const HAS_ARRAY_BUFFER = typeof ArrayBuffer !== 'undefined';

export function isBuffer(source: unknown): source is Buffer {
  return HAS_BUFFER && source instanceof Buffer;
}

export function isArrayBufferView(source: unknown): source is ArrayBufferView {
  return HAS_ARRAY_BUFFER && ArrayBuffer.isView(source);
}

export function copyBuffer(cur: Buffer | ArrayBufferView) {
  if (isBuffer(cur)) {
    return Buffer.from(cur);
  }
  return Buffer.from(cur.buffer.slice(0), cur.byteOffset, cur.byteLength);
}
