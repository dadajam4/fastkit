import path from 'node:path';
import fs from 'node:fs';
import { isFileNotFoundException } from './utils';

export class Path {
  private _value: string;
  private _stats?: fs.Stats;

  get value() {
    return this._value;
  }

  set value(value) {
    const _value = path.resolve(value);
    if (_value === this._value) return;
    this._value = path.resolve(value);
    delete this._stats;
  }

  get dirname() {
    return path.dirname(this.value);
  }

  get basename() {
    return path.basename(this.value);
  }

  get extname() {
    return path.extname(this.value);
  }

  get stats() {
    let { _stats } = this;
    if (!_stats) {
      _stats = fs.statSync(this.value);
      this._stats = _stats;
    }
    return _stats;
  }

  get isDirectory() {
    return this.stats.isDirectory;
  }

  get isFile() {
    return this.stats.isFile;
  }

  constructor(value: string) {
    this._value = path.resolve(value);
  }

  toString() {
    return this.value;
  }

  valueOf() {
    return this.value;
  }

  toJSON() {
    return this.value;
  }

  relative(to: string) {
    return new Path(path.relative(this.value, to));
  }

  join(...paths: string[]) {
    return new Path(path.join(this.value, ...paths));
  }

  resolve(...paths: string[]) {
    return new Path(path.resolve(this.value, ...paths));
  }

  private _join(...paths: (string | undefined)[]) {
    const _paths = paths.filter((path): path is string => !!path);
    return _paths.length ? path.join(this.value, ..._paths) : this.value;
  }

  async readdir(...paths: string[]): Promise<Path[]> {
    const dir = this._join(...paths);
    const files = await fs.promises.readdir(dir);
    return files.map((file) => {
      return new Path(path.join(dir, file));
    });
  }

  readFile<D = undefined>(
    pathAppend?: string,
    defaults?: D,
  ): Promise<D extends undefined ? string : string | D> {
    return new Promise<any>((resolve, reject) => {
      fs.readFile(this._join(pathAppend), 'utf-8', (err, data) => {
        if (err) {
          if (defaults !== undefined && isFileNotFoundException(err)) {
            return resolve(defaults);
          }
          return reject(err);
        }
        resolve(data);
      });
    });
  }

  async readJSON<T = any, D = undefined>(
    pathAppend?: string,
    defaults?: D,
  ): Promise<D extends undefined ? T : T | D> {
    try {
      const file = await this.readFile(pathAppend);
      return JSON.parse(file);
    } catch (err) {
      if (defaults === undefined) {
        throw err;
      }
      return defaults as any;
    }
  }
}
