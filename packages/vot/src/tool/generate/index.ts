import path from 'node:path';
import fs from 'fs-extra';
import {
  resolveViteConfig,
  findVotPlugin,
  resolveExtractedPages,
} from '../utils';
import { ResolvedConfig } from 'vite';
import {
  generateVotGeneratePagePaths,
  VOT_GENERATE_PAGES_PATH,
} from '../../schemes/generate';
import http, { Server } from 'node:http';
import chalk from 'chalk';
import dns from 'node:dns';

function isIncomingMessage(source: unknown): source is http.IncomingMessage {
  return (
    !!source &&
    typeof source === 'object' &&
    typeof (source as http.IncomingMessage).statusCode === 'number'
  );
}

function httpRequest(options: http.RequestOptions) {
  return new Promise<string | { status: number }>((resolve, reject) => {
    let chunks = '';
    const req = http.request(options, (res) => {
      if (res.statusCode !== 200) {
        return reject(res);
      }
      res.on('data', (d) => {
        chunks += typeof d === 'string' ? d : d.toString();
      });
      res.on('end', () => {
        resolve(chunks);
      });
    });
    req.on('error', (error) => {
      reject(error);
    });
    req.end();
  });
}

export async function generate(_config?: ResolvedConfig) {
  // @FIXME Node18用の対策。もうちょっと良い解決がありそう
  dns.setDefaultResultOrder('ipv4first');

  const viteConfig = _config || (await resolveViteConfig());
  const distDir =
    viteConfig.build?.outDir ?? path.resolve(process.cwd(), 'dist');
  const clientOutDir = path.resolve(distDir, 'client');

  const findVotPluginResult = findVotPlugin(viteConfig.plugins);

  if (!findVotPluginResult) {
    throw new Error('missing vot plugin.');
  }

  const { generateOptions } = findVotPluginResult;

  if (generateOptions.mode === 'off') {
    return;
  }

  const { serve } = await import('../../server');

  let basePrefix = '';
  let viteBase = viteConfig.base;

  if (viteBase) {
    if (viteBase.startsWith('http')) {
      viteBase = viteBase.replace(/^https?:\/\//, '');
      viteBase = viteBase.replace(viteBase.split('/')[0], '');
    }
    viteBase = viteBase.replace(/^\//, '').replace(/\/$/, '');
    basePrefix = `/${viteBase}`;
  }

  const launched = await serve();
  const server: Server = launched.server;
  const host = launched.host;
  const port = launched.port;
  const normalizePath = (path: string) => {
    if (!path.endsWith('/')) {
      path += '/';
    }
    path = path.replace(/^\/\//, '/');
    return path;
  };

  const PAGES_PATH = normalizePath(
    `${basePrefix.replace(/\/$/, '')}/${VOT_GENERATE_PAGES_PATH}/`,
  );

  console.log(
    '■■■■',
    host === '0.0.0.0' ? 'localhost' : host,
    port,
    PAGES_PATH,
  );

  const routes = JSON.parse(
    (
      await httpRequest({
        protocol: 'http:',
        host: host === '0.0.0.0' ? 'localhost' : host,
        port,
        path: PAGES_PATH,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).toString(),
  );

  const pages = resolveExtractedPages(routes).filter(
    (page) => !page.path.includes('__VOT_GENERATE_PAGES__'),
  );

  const filteredPages = generateVotGeneratePagePaths(generateOptions, pages);
  if (!filteredPages.length) {
    console.log(chalk.gray('No pages found for generate.'));
    server.close();
    return;
  }

  const { length } = filteredPages;
  let completed = 0;

  try {
    await Promise.all(
      filteredPages.map(async (pagePath) => {
        const requestPath = normalizePath(`${basePrefix}${pagePath}`);
        const outDir = path.join(clientOutDir, pagePath);
        const outPath = path.join(outDir, 'index.html');
        await fs.remove(outPath);

        try {
          const html = await httpRequest({
            protocol: 'http:',
            host: host === '0.0.0.0' ? 'localhost' : host,
            port,
            path: requestPath,
            method: 'GET',
            headers: {
              'Content-Type': 'text/html',
            },
          });
          if (typeof html !== 'string') {
            throw { statusCode: html.status };
          }
          await fs.ensureDir(outDir);
          await fs.writeFile(outPath, html);
          completed++;
          console.log(
            `(${completed}/${length}) ${chalk.gray(
              'generated >>> ',
            )}${chalk.cyan(pagePath)}`,
          );
        } catch (_err) {
          completed++;
          if (isIncomingMessage(_err)) {
            console.log(
              `${chalk.yellow(
                `(${completed}/${length}) skip generate status[${
                  _err.statusCode || 'NA'
                }] >>> `,
              )}${chalk.red(pagePath)}`,
            );
          } else {
            throw _err;
          }
        }
      }),
    );
  } finally {
    server.close();
  }

  const outputSync =
    generateOptions.outputSync && path.resolve(generateOptions.outputSync);

  if (outputSync) {
    await fs.emptyDir(outputSync);
    await fs.copySync(clientOutDir, outputSync);
  }
}
