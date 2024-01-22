/* eslint-disable no-console */
import path from 'node:path';
import fs from 'fs-extra';
import { ResolvedConfig } from 'vite';
import http from 'node:http';
import chalk from 'chalk';
import {
  generateVotGeneratePagePaths,
  VOT_GENERATE_PAGES_PATH,
} from '../../schemes/generate';
import {
  resolveViteConfig,
  findVotPlugin,
  resolveExtractedPages,
} from '../utils';

function isIncomingMessage(source: unknown): source is http.IncomingMessage {
  return (
    !!source &&
    typeof source === 'object' &&
    typeof (source as http.IncomingMessage).statusCode === 'number'
  );
}

function httpRequest(url: string, options: http.RequestOptions) {
  return new Promise<string | { status: number }>((resolve, reject) => {
    let chunks = '';
    const req = http.request(url, options, (res) => {
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

  const findVotPluginResult = findVotPlugin(viteConfig.plugins);

  if (!findVotPluginResult) {
    throw new Error('missing vot plugin.');
  }

  const { generateOptions } = findVotPluginResult;

  if (generateOptions.mode === 'off') {
    return;
  }

  const { serve } = await import('../../server');

  const launched = await serve();
  const { server } = launched;

  const urlParseRe = /(https?:)([^?]+)(\?.+)?/;
  const normalizeUrl = (url: string) => {
    const matched = url.replace(/\/+/g, '/').match(urlParseRe);
    if (!matched) throw new Error(`Invalid url: ${url}`);
    const protocol = matched[1];
    // eslint-disable-next-line no-shadow
    let path = matched[2];
    const query = matched[3] || '';
    if (!path.endsWith('/')) {
      path += '/';
    }
    return `${protocol}/${path}${query}`;
  };

  /**
   * @TODO
   * If you have not released the host, it may not exist
   */
  const baseUrl = launched.resolvedUrls.network[0];

  const PAGES_URL = normalizeUrl(`${baseUrl}${VOT_GENERATE_PAGES_PATH}/`);

  const routes = JSON.parse(
    (
      await httpRequest(PAGES_URL, {
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
        const requestUrl = normalizeUrl(`${baseUrl}${pagePath}`);
        const outDir = path.join(clientOutDir, pagePath);
        const outPath = path.join(outDir, 'index.html');
        await fs.remove(outPath);

        try {
          const html = await httpRequest(requestUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'text/html',
            },
          });
          if (typeof html !== 'string') {
            // eslint-disable-next-line no-throw-literal
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
            console.error(`failed >>> ${pagePath}`);
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
