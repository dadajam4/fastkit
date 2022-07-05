import path from 'path';
import fs from 'fs-extra';
import { resolveViteConfig } from '../utils';
import { Plugin, ResolvedConfig } from 'vite';
import { VotExtractedPage } from '../../schemes/page';
import { VotPluginOptions } from '../../schemes/options';
import {
  resolveRawVotGenerateOptions,
  generateVotGeneratePagePaths,
} from '../../schemes/generate';
import http, { Server } from 'http';
import chalk from 'chalk';

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
  const viteConfig = _config || (await resolveViteConfig());
  const distDir =
    viteConfig.build?.outDir ?? path.resolve(process.cwd(), 'dist');
  const clientOutDir = path.resolve(distDir, 'client');

  const votPlugin = findPlugin('vite:vot');

  if (!votPlugin) {
    throw new Error('missing vot plugin.');
  }

  const options: VotPluginOptions = (votPlugin as any).__options__;

  if (!options) {
    throw new Error('missing vot plugin options.');
  }

  const generateOptions = resolveRawVotGenerateOptions(options.generate);

  if (generateOptions.mode === 'off') {
    return;
  }

  const pages: VotExtractedPage[] = (
    await (votPlugin as any)._extractPages()
  ).flat();

  const filteredPages = generateVotGeneratePagePaths(generateOptions, pages);
  if (!filteredPages.length) {
    console.log(chalk.gray('No pages found for generate.'));
    return;
  }

  const serve = require('../../bin/serve-fn');
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

  try {
    await Promise.all(
      filteredPages.map(async (pagePath) => {
        let requestPath = `${basePrefix}${pagePath}`;
        if (!requestPath.endsWith('/')) {
          requestPath += '/';
        }
        requestPath = requestPath.replace(/^\/\//, '/');
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
          await fs.ensureDir(outDir);
          await fs.writeFile(outPath, html);
          console.log(`${chalk.gray('generated >>> ')}${chalk.cyan(pagePath)}`);
        } catch (_err) {
          if (isIncomingMessage(_err)) {
            console.log(
              `${chalk.yellow(
                `skip generate status[${_err.statusCode || 'NA'}] >>> `,
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

  function findPlugin(
    pluginName: string,
    buckets = viteConfig.plugins,
  ): Plugin | undefined {
    for (const row of buckets) {
      if (Array.isArray(row)) {
        const hit = findPlugin(pluginName, row);
        if (hit) return hit;
      }
      if (row.name === pluginName) {
        return row;
      }
    }
  }
}
