import { hashElement, HashElementNode } from 'folder-hash';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'fs-extra';
import { pathExists } from './path';
import { NodeUtilError } from './logger';

const DEFAULT_META_NAME = '.hash';

/**
 * `JSON.stringify` with object keys sorted, so that two values that differ only
 * in the order their keys were assigned serialize identically. Without it the
 * order of an options object — which follows however it was built — would count
 * as a change.
 */
function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, val) =>
    val && typeof val === 'object' && !Array.isArray(val)
      ? Object.fromEntries(
          Object.keys(val)
            .sort()
            .map((key) => [key, (val as Record<string, unknown>)[key]]),
        )
      : val,
  );
}

export interface HashComparatorOptions {
  metaFile?: string;

  /**
   * Extra values that decide the output, folded into the comparison.
   *
   * A directory hash of `src` only answers "did the sources change". It cannot
   * answer "would this run produce something different", which is also decided
   * by the generator's own version and its effective options. Whatever is passed
   * here is hashed alongside `src` and stored in the meta file, so a change to
   * it counts as a change. Key order does not matter.
   */
  inputs?: unknown;
}

/**
 * What {@link HashComparator} stores in its meta file.
 *
 * `hash` stays exactly the directory hash of `src`; anything from
 * {@link HashComparatorOptions.inputs} is kept beside it rather than mixed into
 * it, so both remain readable. A meta file written before `inputs` existed has
 * no `inputsHash`, which compares unequal to any inputs and therefore
 * regenerates once — the intended behaviour on an upgrade.
 */
export interface HashComparatorMeta extends HashElementNode {
  inputsHash?: string;
}

export class HashComparator {
  readonly src: string;

  readonly dest: string;

  readonly metaFile: string;

  readonly inputsHash?: string;

  private _lastSrcHash?: HashComparatorMeta;

  constructor(src: string, dest: string, opts: HashComparatorOptions = {}) {
    this.src = src;
    this.dest = dest;

    const { metaFile = DEFAULT_META_NAME, inputs } = opts;

    if (inputs !== undefined) {
      this.inputsHash = crypto
        .createHash('sha256')
        .update(stableStringify(inputs))
        .digest('hex');
    }

    this.metaFile = path.isAbsolute(metaFile)
      ? metaFile
      : path.join(dest, metaFile);
  }

  async loadSrcHash(): Promise<HashComparatorMeta | undefined> {
    const { src, inputsHash } = this;
    if (await pathExists(src)) {
      const hash: HashComparatorMeta = await hashElement(src);
      if (inputsHash !== undefined) {
        hash.inputsHash = inputsHash;
      }
      this._lastSrcHash = hash;
      return hash;
    }
  }

  async loadDestHash(): Promise<HashComparatorMeta | undefined> {
    const { metaFile } = this;

    if (await pathExists(metaFile, 'file')) {
      return fs.readJSON(metaFile);
    }
  }

  async load() {
    const [srcHash, destHash] = await Promise.all([
      this.loadSrcHash(),
      this.loadDestHash(),
    ]);
    return {
      srcHash,
      destHash,
    };
  }

  async hasChanged() {
    const { srcHash, destHash } = await this.load();
    if (!srcHash) {
      throw new NodeUtilError('missing src directory.');
    }
    if (!destHash) return srcHash;
    if (srcHash.hash !== destHash.hash) return srcHash;
    if (srcHash.inputsHash !== destHash.inputsHash) return srcHash;
  }

  async commit(hash: HashComparatorMeta | undefined = this._lastSrcHash) {
    if (!hash) {
      hash = await this.loadSrcHash();
    }
    const { metaFile } = this;
    await fs.ensureDir(path.dirname(metaFile));
    await fs.writeJSON(metaFile, hash);
    return hash;
  }
}
