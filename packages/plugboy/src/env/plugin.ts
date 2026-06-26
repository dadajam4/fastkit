import type { PlugboyWorkspace } from '../workspace';
import type { Plugin } from '../types';
import { parse } from 'acorn';
import { PLUGBOY_VAR_ENVS_FOR_BUNDLE } from './constants';

function findAfterImports(code: string): number {
  const ast = parse(code, {
    sourceType: 'module',
    ecmaVersion: 'latest',
  }) as any;

  let end = 0;

  for (const node of ast.body) {
    if (
      node.type === 'ImportDeclaration' ||
      node.type === 'ExportNamedDeclaration' ||
      node.type === 'ExportAllDeclaration' ||
      node.type === 'ExportDefaultDeclaration'
    ) {
      end = Math.max(end, node.end);
      continue;
    }
    break;
  }

  return end;
}

const _replacements: [envName: string, value: string][] = [];

Object.entries(PLUGBOY_VAR_ENVS_FOR_BUNDLE).forEach(([envName, value]) => {
  if (value.startsWith('#')) {
    _replacements.push([`$$${envName}`, value.substring(1)]);
  }
});

export function WorkspaceEnvPlugin(_workspace: PlugboyWorkspace): Plugin {
  return {
    name: 'plugboy-workspace-env',
    async renderChunk(code, _chunk) {
      const injects = _replacements.filter(([envName]) =>
        code.includes(envName),
      );

      if (injects.length) {
        const MagicString = (await import('magic-string')).default;
        const ms = new MagicString(code);

        const insertPos = findAfterImports(code);
        const injectCode = injects
          .map(([eventName, value]) => `const ${eventName} = ${value};`)
          .join('\n');
        ms.appendLeft(insertPos, `\n${injectCode}`);

        return {
          code: ms.toString(),
          map: ms.generateMap({ hires: true }),
        };
      }
    },
  };
}
