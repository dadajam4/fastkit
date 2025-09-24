import path from 'node:path';
import { Project, SourceFile } from 'ts-morph';
import JoyCon from 'joycon';
import chokidar, { FSWatcher } from 'chokidar';
import {
  SourceFileExporter,
  ExportorSerializeHook,
} from './source-file-exporter';

export type WorkspaceInstanceCache = Record<string, Workspace>;

function normalizeWorkspacePath(workspacePath: string) {
  return path.resolve(workspacePath);
}

export interface WorkspacePlugin {
  name: string;
  hooks?: ExportorSerializeHook[];
}

export interface WorkspaceOptions {
  plugins?: WorkspacePlugin[];
}

type RawOptions = WorkspaceOptions | (() => WorkspaceOptions);

export class Workspace {
  static cache: WorkspaceInstanceCache = {};

  static get(workspacePath: string, options?: RawOptions) {
    const normalizedPath = normalizeWorkspacePath(workspacePath);
    const cachedWorkspace = this.cache[normalizedPath];
    if (cachedWorkspace) return cachedWorkspace;
    const workspace = new Workspace(
      normalizedPath,
      typeof options === 'function' ? options() : options,
    );
    this.cache[normalizedPath] = workspace;
    return workspace;
  }

  static getBySourceFilePath(sourceFilePath: string, options?: RawOptions) {
    const cwd = path.dirname(sourceFilePath);
    const loader = new JoyCon({
      cwd,
      parseJSON: () => ({}),
    });
    const loadResult = loader.loadSync(['tsconfig.json']);
    if (!loadResult.path) {
      throw new Error(`missing tsconfig.json >>> ${sourceFilePath}`);
    }
    const workspacePath = path.dirname(loadResult.path);
    return this.get(workspacePath, options);
  }

  readonly dirPath: string;

  readonly tsConfigFilePath: string;

  readonly project: Project;

  readonly plugins: WorkspacePlugin[];

  private _sourceFilePaths: string[] = [];

  get sourceFilePaths() {
    return this._sourceFilePaths;
  }

  constructor(workspacePath: string, options: WorkspaceOptions = {}) {
    const normalizedPath = normalizeWorkspacePath(workspacePath);
    this.dirPath = normalizedPath;
    this.tsConfigFilePath = path.join(normalizedPath, 'tsconfig.json');
    this.project = new Project({
      tsConfigFilePath: this.tsConfigFilePath,
      skipAddingFilesFromTsConfig: true,
    });
    this.plugins = options.plugins || [];
  }

  normalizeSourceFilePath(filePath: string) {
    return path.isAbsolute(filePath)
      ? filePath
      : path.join(this.dirPath, filePath);
  }

  addSourceFileAtPath(filePath: string, withResolve = true) {
    const normalizedFilePath = this.normalizeSourceFilePath(filePath);
    let sourceFile = this.project.getSourceFile(normalizedFilePath);

    if (sourceFile) {
      sourceFile.refreshFromFileSystemSync();
    } else {
      sourceFile = this.project.addSourceFileAtPath(normalizedFilePath);
    }

    withResolve && this.resolveSourceFileDependencies();
    return sourceFile;
  }

  async refreshSourceFile(filePath: string, withResolve = true) {
    const normalizedFilePath = this.normalizeSourceFilePath(filePath);
    const file = this.project.getSourceFile(normalizedFilePath);
    if (!file) return undefined;
    await file.refreshFromFileSystem();
    withResolve && this.resolveSourceFileDependencies();
  }

  removeSourceFile(filePath: string, withResolve = true) {
    const normalizedFilePath = this.normalizeSourceFilePath(filePath);
    const file = this.project.getSourceFile(normalizedFilePath);
    if (file) {
      file.forget();
      withResolve && this.resolveSourceFileDependencies();
      return true;
    }
    return false;
  }

  async refreshSourceFiles(
    refreshSettings: {
      update?: string[];
      remove?: string[];
    },
    withResolve = true,
  ) {
    const promises: (Promise<any> | undefined | boolean)[] = [];

    refreshSettings.update?.forEach((filePath) => {
      promises.push(this.refreshSourceFile(filePath, false));
    });

    refreshSettings.remove?.forEach((filePath) => {
      promises.push(this.removeSourceFile(filePath, false));
    });

    await Promise.all(promises);

    withResolve && this.resolveSourceFileDependencies();
  }

  resolveSourceFileDependencies() {
    this.project.resolveSourceFileDependencies();

    const currentFiles = this.sourceFilePaths;
    const newFiles = this.getSourceFilePaths();
    this._sourceFilePaths = newFiles;

    const { _watcher } = this;
    if (!_watcher) return;

    const adds = newFiles.filter((file) => !currentFiles.includes(file));
    const removes = currentFiles.filter((file) => !newFiles.includes(file));

    adds.length && _watcher.add(adds);
    removes.length && _watcher.un(removes);
    // updateWatcherDependencies() {
    //   const { _watcher } = this;
    //   return _watcher?.updateDependencies(this.sourceFilePaths);
    // }
  }

  // private _updateWatcherFiles() {}

  getHooks(): ExportorSerializeHook[] {
    const hooks: ExportorSerializeHook[] = [];
    for (const plugin of this.plugins) {
      plugin.hooks && hooks.push(...plugin.hooks);
    }
    return hooks;
  }

  createSourceFileExporter(filePath: string): SourceFileExporter {
    const sourceFile = this.addSourceFileAtPath(filePath);
    const exporter = new SourceFileExporter(this, sourceFile);
    return exporter;
  }

  createSourceFileExports(filePath: string) {
    const exporter = this.createSourceFileExporter(filePath);
    return exporter.export();
  }

  private _watcher?: WorkspaceWatcher;

  private _ensureWatcher(): WorkspaceWatcher {
    let { _watcher } = this;
    if (!_watcher) {
      _watcher = new WorkspaceWatcher(this);
      this._watcher = _watcher;
    }
    return _watcher;
  }

  watch(handler: WorkspaceWatchHandler) {
    const watcher = this._ensureWatcher();
    return watcher.watch(handler);
  }

  off(handler: WorkspaceWatchHandler) {
    const watcher = this._ensureWatcher();
    watcher.off(handler);
    if (watcher.isEmpty) {
      watcher.close();
      delete this._watcher;
    }
  }

  getSourceFiles(): SourceFile[] {
    return this.project.getSourceFiles();
  }

  getSourceFilePaths(): string[] {
    return this.getSourceFiles().map((sourceFile) => sourceFile.getFilePath());
  }
}

export type WorkspaceWatchHandler = (watcher: WorkspaceWatcher) => any;

export class WorkspaceWatcher {
  readonly workspace: Workspace;

  readonly watcher: FSWatcher;

  readonly handlers: WorkspaceWatchHandler[] = [];
  // private _dependencies: string[] = [];

  get isEmpty() {
    return this.handlers.length === 0;
  }

  constructor(workspace: Workspace) {
    this.workspace = workspace;
    // this._dependencies = workspace.getSourceFilePaths();

    this.watcher = chokidar.watch(workspace.sourceFilePaths, {
      ignoreInitial: true,
      // awaitWriteFinish: true,
    });

    this.watcher.on('add', (filePath) => {
      workspace.addSourceFileAtPath(filePath);
      this.emit();
    });

    this.watcher.on('change', async (filePath) => {
      await workspace.refreshSourceFile(filePath);
      this.emit();
    });

    this.watcher.on('unlink', async (filePath) => {
      workspace.removeSourceFile(filePath);
      this.emit();
    });
  }

  private emit() {
    for (const handler of this.handlers) {
      handler(this);
    }
  }

  watch(handler: WorkspaceWatchHandler) {
    this.handlers.push(handler);
    return () => this.off(handler);
  }

  off(handler: WorkspaceWatchHandler) {
    const index = this.handlers.indexOf(handler);
    if (index !== -1) this.handlers.splice(index, 1);
  }

  close() {
    this.watcher.close();
  }

  add(paths: string | string[]) {
    this.watcher.add(paths);
  }

  un(paths: string | string[]) {
    this.watcher.unwatch(paths);
  }
}
