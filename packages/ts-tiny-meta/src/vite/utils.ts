import { ViteDevServer, ModuleNode, Update } from 'vite';
import { FILTER_RE } from './constants';

export function filter(id: string) {
  return FILTER_RE.test(id);
}

export function invalidateModules(
  server: ViteDevServer,
  modules: ModuleNode[],
) {
  return modules.forEach((m) => server.moduleGraph.invalidateModule(m));
}

export function sendHmrReload(server: ViteDevServer, modules: ModuleNode[]) {
  const timestamp = +Date.now();

  const ids = modules
    .map((module) => module.id || module.file)
    .filter((id) => !!id) as string[];

  server.ws.send({
    type: 'update',
    updates: ids.map<Update>((id) => ({
      acceptedPath: id,
      path: id,
      timestamp,
      type: 'js-update',
    })),
  });
}

export function reloadModules(server: ViteDevServer, modules: ModuleNode[]) {
  invalidateModules(server, modules);
  sendHmrReload(server, modules);
}
