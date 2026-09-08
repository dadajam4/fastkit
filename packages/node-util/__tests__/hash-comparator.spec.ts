import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { describe, it, expect, beforeEach } from 'vitest';
import { HashComparator } from '../src';

let src: string;
let dest: string;

beforeEach(async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'hash-comparator-'));
  src = path.join(root, 'src');
  dest = path.join(root, 'dest');
  await fs.mkdir(src);
  await fs.mkdir(dest);
  await fs.writeFile(path.join(src, 'a.txt'), 'a', 'utf8');
});

/** `hasChanged()` resolves to the source hash when it changed, undefined when not. */
const changed = async (comparator: HashComparator) =>
  Boolean(await comparator.hasChanged());

describe('source contents', () => {
  it('should report a change until it is committed', async () => {
    const comparator = new HashComparator(src, dest);
    expect(await changed(comparator)).toBe(true);
    await comparator.commit();
    expect(await changed(new HashComparator(src, dest))).toBe(false);
  });

  it('should report a change when a source file is edited', async () => {
    await new HashComparator(src, dest).commit();
    await fs.writeFile(path.join(src, 'a.txt'), 'b', 'utf8');
    expect(await changed(new HashComparator(src, dest))).toBe(true);
  });
});

describe('inputs', () => {
  it('should report a change when they differ, with the sources untouched', async () => {
    const first = new HashComparator(src, dest, {
      inputs: { version: '1.0.0' },
    });
    expect(await changed(first)).toBe(true);
    await first.commit();

    expect(
      await changed(
        new HashComparator(src, dest, { inputs: { version: '1.0.0' } }),
      ),
    ).toBe(false);
    expect(
      await changed(
        new HashComparator(src, dest, { inputs: { version: '1.0.1' } }),
      ),
    ).toBe(true);
  });

  it('should ignore the order the keys were assigned in', async () => {
    const a = new HashComparator(src, dest, {
      inputs: { version: '1.0.0', options: { formats: ['woff2'], round: 10 } },
    });
    await a.commit();

    const permuted = new HashComparator(src, dest, {
      inputs: { options: { round: 10, formats: ['woff2'] }, version: '1.0.0' },
    });
    expect(await changed(permuted)).toBe(false);
  });

  it('should keep array order significant', async () => {
    const a = new HashComparator(src, dest, { inputs: ['woff2', 'otf'] });
    await a.commit();
    expect(
      await changed(
        new HashComparator(src, dest, { inputs: ['otf', 'woff2'] }),
      ),
    ).toBe(true);
  });

  it('should report a change against a meta file written without them', async () => {
    // The upgrade path: output committed by a version that did not fingerprint
    // its inputs has to be regenerated once.
    await new HashComparator(src, dest).commit();
    expect(
      await changed(
        new HashComparator(src, dest, { inputs: { version: '1.0.0' } }),
      ),
    ).toBe(true);
  });

  it('should leave the stored source hash untouched', async () => {
    const withInputs = new HashComparator(src, dest, {
      inputs: { version: '1.0.0' },
    });
    const stored = await withInputs.commit();
    const plain = await new HashComparator(src, dest).loadSrcHash();

    expect(stored?.hash).toBe(plain?.hash);
    expect(stored?.inputsHash).toMatch(/^[0-9a-f]{64}$/);
  });
});
