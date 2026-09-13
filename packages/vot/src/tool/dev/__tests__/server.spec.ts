import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer, ViteDevServer } from 'vite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSSRDevHandler } from '../server';

/**
 * The fixture reproduces the shape that decides the order of the stylesheets:
 * `early.ts` is imported first but only reaches `lazy.css` through a dynamic
 * import, so the client applies `late.css` first even though a plain depth-first
 * walk of the module graph meets `lazy.css` on the way there.
 */
const FIXTURE_FILES: Record<string, string> = {
  'index.html':
    '<!doctype html>\n<html>\n  <head>\n    <title>fixture</title>\n  </head>\n  <body>\n    <div id="app"></div>\n    <script type="module" src="/main.ts"></script>\n  </body>\n</html>\n',
  'main.ts': [
    `import { loadLazy } from './early';`,
    `import './late';`,
    ``,
    `export default async function render(url: string, { template }: any) {`,
    `  await loadLazy();`,
    `  return { html: template };`,
    `}`,
    ``,
  ].join('\n'),
  'early.ts': `export const loadLazy = () => import('./lazy');\n`,
  'lazy.ts': `import './lazy.css';\n\nexport const lazy = true;\n`,
  'late.ts': `import './late.css';\n\nexport const late = true;\n`,
  'lazy.css': `.lazy { color: rgb(1, 2, 3); }\n`,
  'late.css': `.late { color: rgb(4, 5, 6); }\n`,
};

function createFixture() {
  const root = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'vot-dev-server-')),
  );
  for (const [name, content] of Object.entries(FIXTURE_FILES)) {
    fs.writeFileSync(path.join(root, name), content, 'utf-8');
  }
  return root;
}

function request(
  handler: ReturnType<typeof createSSRDevHandler>,
  url = '/',
): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    const response = {
      headersSent: false,
      setHeader: () => undefined,
      end(chunk?: string) {
        if (chunk) body += chunk;
        response.headersSent = true;
        resolve(body);
      },
    };

    handler(
      {
        method: 'GET',
        originalUrl: url,
        headers: { host: 'localhost' },
      } as unknown as IncomingMessage,
      response as unknown as ServerResponse,
      (error?: any) => reject(error || new Error('unexpectedly fell through')),
    );
  });
}

const styleIds = (html: string) =>
  [...html.matchAll(/data-vite-dev-id="([^"]+)"/g)].map(([, id]) => id);

describe('createSSRDevHandler', () => {
  let root: string;
  let server: ViteDevServer;

  beforeEach(async () => {
    root = createFixture();
    server = await createServer({
      root,
      configFile: false,
      logLevel: 'silent',
      server: { middlewareMode: true },
    });
  });

  afterEach(async () => {
    await server.close();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('inlines the stylesheets the render used', async () => {
    const html = await request(createSSRDevHandler(server));

    expect(styleIds(html)).toEqual([
      path.join(root, 'late.css'),
      path.join(root, 'lazy.css'),
    ]);
    expect(html).toContain('.late { color: rgb(4, 5, 6); }');
    expect(html).toContain('.lazy { color: rgb(1, 2, 3); }');
  });

  it('puts the styles in the head and leaves no placeholder behind', async () => {
    const html = await request(createSSRDevHandler(server));

    expect(html).not.toContain('vot-dev-styles');
    const head = html.slice(0, html.indexOf('</head>'));
    expect(styleIds(head)).toHaveLength(2);
  });
});
