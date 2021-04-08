import { Plugin, TransformResult } from 'vite';
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
  return processPostCss(style.css.toString(), file, options);
}

export function rawStylesPlugin(options?: BuildOptions['rawStyles']): Plugin {
  return {
    name: 'rawStyles',
    resolveId(id, parent, importer, ssr) {
      if (parent && idMatchRe.test(id)) {
        const dir = path.dirname(parent);
        const resolved = path.resolve(dir, id);
        return resolved;
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const { url } = req;
        if (url && idMatchRe.test(url)) {
          try {
            const { code } = await compile(url, options);
            res.setHeader('content-type', 'text/javascript');
            res.writeHead(200);
            res.end(code);
          } catch (_err) {
            console.log(_err);
            res.writeHead(500);
            res.end(_err.message);
          }
          return;
        }
        next();
      });
    },
    load(id, ssr) {
      if (idMatchRe.test(id)) {
        return '';
      }
    },
    transform(code, id, ssr) {
      if (idMatchRe.test(id)) {
        return compile(id);
      }
      return null;
    },
  };
}
