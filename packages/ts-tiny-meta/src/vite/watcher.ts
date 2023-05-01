import { Workspace } from '../ts';
import { ViteDevServer } from 'vite';
import { reloadModules } from './utils';

let _server: ViteDevServer | undefined;

function getServer() {
  if (!_server) throw new Error('missing vite dev server');
  return _server;
}

const entryMap = new Map<string, EntryWatcher>();

export class EntryWatcher {
  static setServer(server: ViteDevServer) {
    _server = server;
  }

  static init(id: string, workspace: Workspace): EntryWatcher {
    let entry = entryMap.get(id);
    if (!entry) {
      entry = new EntryWatcher(id, workspace);
      entryMap.set(id, entry);
    }
    return entry;
  }

  readonly id: string;
  private _workspace: Workspace;
  private _close: () => any;

  get workspace() {
    return this._workspace;
  }

  constructor(id: string, workspace: Workspace) {
    this.id = id;
    this._workspace = workspace;
    this._close = workspace.watch(() => this.handleUpdate());
  }

  handleUpdate() {
    const server = getServer();
    const mod = server.moduleGraph.getModuleById(this.id);
    if (!mod) return;
    reloadModules(server, [mod]);
  }

  close() {
    this._close();
  }
}
