import { hashElement, HashElementNode } from 'folder-hash';
import path from 'node:path';
import fs from 'fs-extra';
import { pathExists } from './path';
import { NodeUtilError } from './logger';

const DEFAULT_META_NAME = '.hash';

export interface HashComparatorOptions {
  metaFile?: string;
}

export class HashComparator {
  readonly src: string;
  readonly dest: string;
  readonly metaFile: string;
  private _lastSrcHash?: HashElementNode;

  constructor(src: string, dest: string, opts: HashComparatorOptions = {}) {
    this.src = src;
    this.dest = dest;

    const { metaFile = DEFAULT_META_NAME } = opts;

    this.metaFile = path.isAbsolute(metaFile)
      ? metaFile
      : path.join(dest, metaFile);
  }

  async loadSrcHash(): Promise<HashElementNode | undefined> {
    const { src } = this;
    if (await pathExists(src)) {
      const hash = await hashElement(src);
      this._lastSrcHash = hash;
      return hash;
    }
  }

  async loadDestHash(): Promise<HashElementNode | undefined> {
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
  }

  async commit(hash: HashElementNode | undefined = this._lastSrcHash) {
    if (!hash) {
      hash = await this.loadSrcHash();
    }
    const { metaFile } = this;
    await fs.ensureDir(path.dirname(metaFile));
    await fs.writeJSON(metaFile, hash);
    return hash;
  }
}
