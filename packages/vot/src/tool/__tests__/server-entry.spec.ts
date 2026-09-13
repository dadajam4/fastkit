import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Plugin } from 'vite';
import { votPlugin } from '..';
import { loadServerEntry, resolveServerEntryPath } from '../server-entry';

const roots: string[] = [];

function createRoot(files: Record<string, string> = {}): string {
  const root = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'vot-server-entry-')),
  );
  roots.push(root);
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), content, 'utf-8');
  }
  return root;
}

/**
 * The fixtures export a plain value rather than calling `defineVotServer()`.
 * That helper is an identity function, and skipping it keeps the fixture from
 * having to resolve `@fastkit/vot` outside the workspace.
 */
afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.__VOT_SERVE;
  while (roots.length) {
    fs.rmSync(roots.pop() as string, { recursive: true, force: true });
  }
});

function findVotPlugin(plugins: Plugin[]): Plugin {
  const plugin = plugins.find((row) => row.name === 'vite:vot');
  if (!plugin) throw new Error('missing vot plugin.');
  return plugin;
}

async function callConfigHook(plugin: Plugin, root: string, userConfig = {}) {
  const hook = plugin.config;
  const handler = typeof hook === 'function' ? hook : hook?.handler;
  if (!handler) throw new Error('missing config hook.');
  return (handler as any).call(
    {},
    { root, ...userConfig },
    {
      command: 'serve',
      mode: 'development',
    },
  );
}

describe('resolveServerEntryPath', () => {
  it('picks up `vot.server.ts` at the root without any configuration', () => {
    const root = createRoot({ 'vot.server.ts': 'export default {};\n' });
    expect(resolveServerEntryPath(root)).toBe(path.join(root, 'vot.server.ts'));
  });

  it('returns undefined when the project has no entry', () => {
    expect(resolveServerEntryPath(createRoot())).toBeUndefined();
  });

  it('resolves an explicit entry relative to the root', () => {
    const root = createRoot({ 'config/server.ts': 'export default {};\n' });
    expect(resolveServerEntryPath(root, './config/server.ts')).toBe(
      path.join(root, 'config/server.ts'),
    );
  });

  it('throws rather than silently falling back when an explicit entry is missing', () => {
    const root = createRoot();
    expect(() => resolveServerEntryPath(root, './nope.ts')).toThrow(
      /missing vot server entry/,
    );
  });
});

describe('loadServerEntry', () => {
  it('reads the object form', async () => {
    const root = createRoot({
      'vot.server.ts': 'export default { port: 4321 };\n',
    });
    const config = await loadServerEntry(
      path.join(root, 'vot.server.ts'),
      { command: 'dev', dev: true, mode: 'development' },
      { root },
    );
    expect(config.port).toBe(4321);
  });

  it('evaluates the function form with the context', async () => {
    const root = createRoot({
      'vot.server.ts': [
        'export default async (ctx) => ({',
        '  port: ctx.dev ? 3000 : 8080,',
        '  host: `${ctx.command}:${ctx.mode}`,',
        '});',
        '',
      ].join('\n'),
    });

    const dev = await loadServerEntry(
      path.join(root, 'vot.server.ts'),
      { command: 'dev', dev: true, mode: 'development' },
      { root },
    );
    expect(dev).toMatchObject({ port: 3000, host: 'dev:development' });

    const serve = await loadServerEntry(
      path.join(root, 'vot.server.ts'),
      { command: 'serve', dev: false, mode: 'production' },
      { root },
    );
    expect(serve).toMatchObject({ port: 8080, host: 'serve:production' });
  });

  it('rejects an entry without a default export', async () => {
    const root = createRoot({ 'vot.server.ts': 'export const port = 1;\n' });
    await expect(
      loadServerEntry(
        path.join(root, 'vot.server.ts'),
        { command: 'dev', dev: true, mode: 'development' },
        { root },
      ),
    ).rejects.toThrow(/has no default export/);
  });
});

describe('votPlugin() server entry integration', () => {
  it('feeds the entry into the development server config', async () => {
    const root = createRoot({
      'vot.server.ts':
        "export default { port: 4321, host: '0.0.0.0', proxy: { '/api': 'http://localhost:9' } };\n",
    });

    const config = await callConfigHook(
      findVotPlugin(votPlugin() as Plugin[]),
      root,
    );

    expect(config.server).toMatchObject({
      port: 4321,
      host: '0.0.0.0',
      proxy: { '/api': 'http://localhost:9' },
    });
  });

  it('lets the entry win over vite.config.ts and says so', async () => {
    const root = createRoot({
      'vot.server.ts': 'export default { port: 4321 };\n',
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const config = await callConfigHook(
      findVotPlugin(votPlugin() as Plugin[]),
      root,
      { server: { port: 9999 } },
    );

    expect(config.server.port).toBe(4321);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('`server.port` is set in both'),
    );
  });

  it('reports `serve` to the entry when `vot serve` falls back to the vite config', async () => {
    const root = createRoot({
      'vot.server.ts':
        'export default (ctx) => ({ port: ctx.dev ? 3000 : 8080 });\n',
    });
    process.env.__VOT_SERVE = 'true';

    const config = await callConfigHook(
      findVotPlugin(votPlugin() as Plugin[]),
      root,
    );

    expect(config.server.port).toBe(8080);
  });

  it('mounts middleware from the entry', async () => {
    const root = createRoot({
      'vot.server.ts': [
        'export default {',
        '  configureServer({ use }) {',
        "    use('/healthcheck', () => {});",
        '  },',
        '};',
        '',
      ].join('\n'),
    });

    const plugin = findVotPlugin(votPlugin() as Plugin[]);
    await callConfigHook(plugin, root);

    const use = vi.fn();
    const hook = plugin.configureServer;
    const handler = typeof hook === 'function' ? hook : hook?.handler;
    await (handler as any).call({}, { middlewares: { use } });

    expect(use).toHaveBeenCalledWith('/healthcheck', expect.any(Function));
  });
});
