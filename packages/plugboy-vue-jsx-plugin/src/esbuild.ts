import { ESBuildPlugin } from '@fastkit/plugboy';
import fs from 'node:fs/promises';
import { transform } from '@babel/core';
import vue3Jsx from '@vue/babel-plugin-jsx';
import { JSXOptions, PLUGIN_NAME } from './types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import TS from '@babel/plugin-transform-typescript';
import type { TransformOptions } from '@babel/core';

const TS_MATCH_RE = /\.tsx?$/;

export const isTS = (id: string) => TS_MATCH_RE.test(id);

export const transformVue3 = async (
  code: string,
  id: string,
  options: JSXOptions = {},
) => {
  const { sourceMaps = true } = options;

  const transformOptions: TransformOptions = {
    babelrc: false,
    configFile: false,
    plugins: [[vue3Jsx, options]],
    sourceMaps,
    sourceFileName: id,
  };

  if (isTS(id)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    transformOptions.plugins!.push([
      TS,
      { isTSX: true, allowExtensions: true },
    ]);
  }

  const result = transform(code, transformOptions);
  if (!result?.code) return;

  return {
    code: result.code,
    map: result.map,
  };
};

export function ESBuildVueJSX(options?: JSXOptions): ESBuildPlugin {
  return {
    name: PLUGIN_NAME,
    setup(build) {
      build.onLoad({ filter: /\.(j|t)sx$/ }, async (args) => {
        const { path } = args;
        const code = await fs.readFile(path, 'utf8');
        const result = await transformVue3(code, path, options);
        if (!result) return;

        return {
          contents: result.code,
        };
      });
    },
  };
}
