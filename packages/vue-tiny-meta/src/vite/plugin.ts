import { extractAll } from '../serializers';
import type { PluginOption, FilterPattern } from 'vite';
import { createFilter } from 'vite';
import MagicString from 'magic-string';
import { SerializeVueOptions } from '../types';

const EXTENSION_INCLUDES_RE = /\.(tsx|ts)$/;
const BASE_FILTER_RE = /\sdefineComponent\(/;

export interface ViteVueTinyMetaOptions extends SerializeVueOptions {
  include?: FilterPattern;
  exclude?: FilterPattern;
  /**
   * @default __docgenInfo
   */
  injectProperty?: string;
}

export function ViteVueTinyMeta(
  options: ViteVueTinyMetaOptions = {},
): PluginOption {
  const { include, exclude, injectProperty = '__docgenInfo' } = options;
  const extensionFilter = createFilter(EXTENSION_INCLUDES_RE);
  const customFilter = createFilter(include, exclude);

  return {
    name: 'vue-tiny-meta',

    async transform(src: string, id: string) {
      if (!extensionFilter(id)) return;
      if (!customFilter(id)) return;
      if (!BASE_FILTER_RE.test(src)) return;

      const allData = await extractAll(id, options);
      if (!allData.length) return;

      const s = new MagicString(src);
      s.append(
        `;${allData
          .map(
            (data) =>
              `${data.exportName}.${injectProperty} = ${JSON.stringify(data)};`,
          )
          .join('\n')}`,
      );

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true, source: id }),
      };
    },
  };
}
