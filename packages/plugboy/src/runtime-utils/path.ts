import { stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Universal ESM function to get the file path of the caller.
 * Works in Node.js, Deno, and Bun (native ESM environments).
 *
 * - Uses V8 structured stack traces when available (Node/Bun).
 * - Falls back to string-based stack parsing when necessary (e.g., Deno).
 * - Throws a descriptive error when the file path cannot be determined.
 */

class CallerFileError extends Error {
  info: unknown;
  constructor(message: string, info: unknown = {}) {
    super(message);
    this.name = 'CallerFileError';
    this.info = info;
  }
}

/**
 * Returns the absolute file path of the calling file.
 *
 * @param {number} depth - 1 = immediate caller, 2 = caller's caller, etc.
 * @returns {string} Absolute file path of the caller.
 * @throws {CallerFileError} If the caller file cannot be determined.
 */
export function getCallerFile(depth = 1) {
  if (typeof depth !== 'number' || depth < 1) {
    throw new CallerFileError('Invalid depth argument', { depth });
  }

  // --- Primary method: V8 structured stack trace (Node.js / Bun) ---
  try {
    const originalPrepare = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, structuredStackTrace) => structuredStackTrace;
    const err = new Error();
    const { stack } = err;
    Error.prepareStackTrace = originalPrepare;

    if (Array.isArray(stack)) {
      const frame = stack[depth];
      if (frame && typeof frame.getFileName === 'function') {
        const file = frame.getFileName();
        if (typeof file === 'string') return file;
        throw new CallerFileError('CallSite#getFileName() returned null', {
          frame,
        });
      } else {
        throw new CallerFileError('Invalid or missing CallSite object', {
          frame,
        });
      }
    } else {
      throw new CallerFileError('Structured stack trace unavailable', {
        stack,
      });
    }
  } catch (v8Error) {
    // --- Fallback: plain text stack parsing (Deno and others) ---
    try {
      const stackStr = new Error().stack;
      if (typeof stackStr !== 'string') {
        throw new CallerFileError('Error.stack is not a string', {
          stack: stackStr,
        });
      }

      const lines = stackStr
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const index = 1 + depth;
      if (index >= lines.length) {
        throw new CallerFileError('Stack trace too shallow', { lines });
      }

      const line = lines[index];

      // Match file URLs or absolute paths
      const match =
        line.match(/(file:\/\/[^\s)]+)/) ||
        line.match(/(\/[^:\s)]+)(:\d+){0,2}/) ||
        line.match(/([A-Za-z]:\\[^:\s)]+)(:\d+){0,2}/);

      if (!match) {
        throw new CallerFileError('No file path pattern found in stack line', {
          line,
        });
      }

      const raw = match[1];
      if (raw.startsWith('file://')) {
        const url = new URL(raw);
        return url.pathname;
      }

      return raw.replace(/:\d+(:\d+)?$/, '');
    } catch (fallbackError) {
      if (fallbackError instanceof CallerFileError) throw fallbackError;
      throw new CallerFileError('Fallback stack parsing failed', {
        cause: fallbackError,
      });
    }
  }
}

/**
 * Returns the absolute file path of the calling file.
 *
 * @param {number} depth - 1 = immediate caller, 2 = caller's caller, etc.
 * @returns {string} Absolute file path of the caller.
 * @throws {CallerFileError} If the caller file cannot be determined.
 */
export function getCallerFilePath(depth = 1) {
  const file = getCallerFile(depth + 1);
  return file.startsWith('file:') ? fileURLToPath(file) : file;
}

/**
 * Returns the directory that contains the package.json
 * associated with the specified import.meta.url.
 *
 * If no package.json is found while walking up the directory tree,
 * an error will be thrown.
 */
export async function getPackageDir(
  callerFilePath = getCallerFilePath(),
): Promise<string> {
  // const { stat } = await import('node:fs/promises');
  // const { join, dirname } = await import('node:path');
  // const { fileURLToPath } = await import('node:url');

  let dir = dirname(callerFilePath);

  while (true) {
    const pkgJson = join(dir, 'package.json');

    const exists = await stat(pkgJson)
      .then(() => true)
      .catch(() => false);
    if (exists) return dir;

    // Move to the parent directory
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  throw new Error(`package.json not found for: ${callerFilePath}`);
}
