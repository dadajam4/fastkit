import path from 'node:path';
import fs from 'fs-extra';
import { compare, META_DIR_NAME, HISTORY_FILE_NAME } from './compare';
import {
  HashedSyncOptions,
  HashedSyncProcessor,
  HashedSyncProcessorStack,
  CompareResult,
} from './schemes';
import { HashedSyncError } from './logger';
import { processors } from './processors';

export class HashedSync {
  /**
   * 同期元ディレクトリ
   */
  readonly src: string;

  /**
   * 同期先ディレクトリ
   */
  readonly dest: string;

  /**
   * 比較結果
   */
  compareResult: CompareResult = {
    src: '',
    dest: '',
    metaDir: '',
    historyPath: '',
    current: [],
    before: [],
    removes: [],
    updates: [],
    updateInformations: [],
  };

  /**
   * 同期処理プロセッサー
   */
  processors: HashedSyncProcessor[];

  get metaDir() {
    return path.join(this.dest, META_DIR_NAME);
  }

  get historyPath() {
    return path.join(this.metaDir, HISTORY_FILE_NAME);
  }

  get hasUpdate() {
    return this.updateInformations.length > 0;
  }

  get before() {
    return this.compareResult.before;
  }

  get current() {
    return this.compareResult.current;
  }

  get removes() {
    return this.compareResult.removes;
  }

  get updates() {
    return this.compareResult.updates;
  }

  get updateInformations() {
    return this.compareResult.updateInformations;
  }

  get stacks() {
    const stacks: HashedSyncProcessorStack[] = [];

    let _updates = this.updates.slice();

    for (const processor of this.processors) {
      const updates = _updates.filter((update) => processor.match(update));
      stacks.push({
        processor,
        updates,
      });
      _updates = _updates.filter((u) => !updates.includes(u));
    }
    return stacks;
  }

  constructor(opts: HashedSyncOptions) {
    const { src, dest } = opts;
    let rawProcessors = opts.processors;
    if (!rawProcessors) {
      rawProcessors = ['imagemin', 'copy'];
    }

    this.src = path.resolve(src);
    this.dest = path.resolve(dest);

    this.processors = rawProcessors.map((rawProcessor) => {
      let processor: HashedSyncProcessor;
      if (typeof rawProcessor === 'string') {
        processor = processors[rawProcessor];
        if (!processor) {
          throw new HashedSyncError(`missing Processor name "${rawProcessor}"`);
        }
      } else {
        processor = rawProcessor;
      }
      return processor;
    });
    this.processors.sort((a, b) => {
      const an = a.name;
      const bn = b.name;
      if (an === 'copy') return 1;
      if (bn === 'copy') return -1;
      return 0;
    });
  }

  async load() {
    this.compareResult = await compare(this.src, this.dest);
  }

  async sync() {
    const { stacks } = this;
    await this.clean();
    for (const stack of stacks) {
      const { processor, updates } = stack;
      if (updates.length) {
        await processor.proc(updates);
      }
    }
    await this.saveSyncMeta();
  }

  async loadAndSync() {
    await this.load();
    await this.sync();
  }

  async saveSyncMeta() {
    await this.saveHistory();
  }

  clean() {
    return Promise.all(
      this.removes.map((item) => {
        return fs.remove(item.dest);
      }),
    );
  }

  async saveHistory() {
    await fs.ensureDir(this.metaDir);
    await fs.writeFile(this.historyPath, JSON.stringify(this.current));
  }
}
