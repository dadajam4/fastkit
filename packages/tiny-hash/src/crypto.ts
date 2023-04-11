let __crypto: Crypto | undefined;

/**
 * Obtaining a Crypto instance
 *
 * @remarks It tries to detect the API of each Node and Browser in the execution environment.
 * @returns Crypto instance
 * @throws Throws exception if instance not found
 */
export async function getCrypto(): Promise<Crypto> {
  if (!__crypto) {
    if (typeof crypto !== 'undefined') {
      __crypto = crypto;
      return crypto;
    } else {
      const { webcrypto } = await import('node:crypto');
      __crypto = webcrypto as any;
    }
  }
  if (!__crypto) {
    throw new Error('missing Crypto.');
  }
  return __crypto;
}

/**
 * Hash function to generate a message digest with 256 bits of text
 * @param text - String to be hashed
 * @returns Message Digest
 */
export async function sha256(text: string): Promise<string> {
  const crypto = await getCrypto();
  const uint8 = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', uint8);
  return Array.from(new Uint8Array(digest))
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');
}
