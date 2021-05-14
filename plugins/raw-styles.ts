import { Plugin, TransformResult, ViteDevServer } from 'vite';
import path from 'path';
import sass from 'sass';
import Fiber from 'fibers';
import postcss from 'postcss';
// import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import { findPackage } from '../core/utils';
import { BuildOptions } from '../core/schemes';

const cssnano = require('cssnano');

const idMatchRe = /(\.s?css)!raw(\?import)?$/;

function processSass(file: string) {
  const custom: any = {
    fiber: Fiber,
  };
  return new Promise<sass.Result>((resolve, reject) => {
    sass.render(
      {
        file: file,
        // data: code,
        ...custom,
        // sourceMap: true,
        // sourceMapContents: true,
      },
      (err, result) => {
        return err ? reject(err) : resolve(result);
      },
    );
  });
}

async function processPostCss(
  css: string,
  file: string,
  options?: BuildOptions['rawStyles'],
): Promise<TransformResult> {
  const pkg = await findPackage(file);
  const opts =
    options || (pkg && pkg.buildOptions && pkg.buildOptions.rawStyles) || {};
  const postcssProcesser = postcss([
    autoprefixer({
      ...opts.autoprefixer,
    }),
    cssnano({
      preset: 'default',
    }),
  ]);

  const result = await postcssProcesser.process(css.toString(), {
    from: file,
  });

  const code = `export default \`${result.css}\`;`;
  return {
    code,
    map: null,
    // map: {
    //   mappings: '',
    // },
  };
}

async function compile(
  rawId: string,
  options?: BuildOptions['rawStyles'],
): Promise<TransformResult> {
  const file = rawId.replace(idMatchRe, '$1');
  const style = await processSass(file);
  const deps = new Set<string>(style.stats.includedFiles.map((file) => file));
  return processPostCss(style.css.toString(), file, options).then((result) => {
    return {
      ...result,
      deps: Array.from(deps),
    };
  });
}

export function rawStylesPlugin(options?: BuildOptions['rawStyles']): Plugin {
  let server: ViteDevServer;

  return {
    name: 'rawStyles',
    resolveId(id, parent, importer, ssr) {
      if (parent && idMatchRe.test(id)) {
        const dir = path.dirname(parent);
        const resolved = path.resolve(dir, id);
        return resolved;
      }
    },
    configureServer(_server) {
      server = _server;
    },
    load(id, ssr) {
      if (idMatchRe.test(id)) {
        return '';
      }
    },
    async transform(_code, id, ssr) {
      if (!idMatchRe.test(id)) return;
      const { code, map, deps } = await compile(id);

      if (server) {
        const { moduleGraph } = server;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const thisModule = moduleGraph.getModuleById(id)!;
        moduleGraph.updateModuleInfo(
          thisModule,
          new Set(deps),
          new Set(),
          false,
        );

        if (deps) {
          deps.forEach((file) => {
            this.addWatchFile(file);
          });
        }
      }
      return {
        code,
        map,
      };
    },
  };
}
