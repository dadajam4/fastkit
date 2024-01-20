import {
  WorkspacePlugin,
  ExportorSerializeHook,
} from '@fastkit/ts-tiny-meta/ts';
import { SerializeVueOptions, VueComponentMeta } from './types';
import { extractSerializeVueSource, serializeVue } from './serializers';

export function SerializeVueHook(
  options?: SerializeVueOptions,
): ExportorSerializeHook<VueComponentMeta> {
  return (exporter, declaration, name) => {
    const source = extractSerializeVueSource(exporter, declaration, name);
    if (!source) return;

    const details = serializeVue(exporter, source, options);

    return {
      kind: 'custom',
      name: 'vue',
      details,
      docs: details.docs,
    };
  };
}

export function SerializeVue(options?: SerializeVueOptions): WorkspacePlugin {
  return {
    name: 'vue',
    hooks: [SerializeVueHook(options)],
  };
}
