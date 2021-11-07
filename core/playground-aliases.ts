import { Plugin } from 'vite';
import { PACKAGES_DIR, targets } from '../core/utils';

export const fastkitAliases = Object.fromEntries(
  targets.map((target) => {
    const id = target === 'fastkit' ? 'fastkit/' : `@fastkit/${target}/`;
    return [id, `${PACKAGES_DIR.join(target)}/src/`];
  }),
);

export function aliasesPlugin(options = {}): Plugin {
  return {
    name: 'playground:aliases',
    config(config) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        ...fastkitAliases,
      };
    },
  };
}
