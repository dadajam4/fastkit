import type { PlugboyWorkspace } from '../workspace';
import type { Plugin } from '../types';
// import path from 'node:path';
// import { fileURLToPath } from 'node:url';

// export const RELATIVE_PATH_FOR_WORKSPACE =
//   '@@__PLUGBOY_RELATIVE_PATH_FOR_WORKSPACE__';

export function WorkspaceEnvPlugin(workspace: PlugboyWorkspace): Plugin {
  // const wsDirRelative = path.relative(
  //   workspace.dirs.dist.value,
  //   workspace.dir.value,
  // );

  // console.log('------', wsDirRelative);
  // workspace.dir.relative
  // workspace.dirs.dist
  return {
    name: 'plugboy-workspace-env',
    // transform: {
    //   filter: {
    //     id: {
    //       include: /^(?!.*\.d\.ts$).*\.(?:[cm]?js|[cm]?ts|tsx)$/,
    //     },
    //     // code: {
    //     //   include: RELATIVE_PATH_FOR_WORKSPACE,
    //     // },
    //   },
    //   handler: async (code, id, { magicString }) => {
    //     if (id.startsWith('\0')) return null; // Virtual module
    //     if (id.startsWith('data:')) return null; // Data URL

    //     // console.log('★★★★★', id, code);

    //     const filePath = id.startsWith('file:') ? fileURLToPath(id) : id;
    //     const relativePath = path.relative(
    //       path.dirname(filePath),
    //       workspace.dir.value,
    //     );

    //     if (magicString) {
    //       // console.log('●', PLUGBOY_ENV_FN_INJECTS);
    //       magicString.replace(RELATIVE_PATH_FOR_WORKSPACE, relativePath);
    //       return {
    //         code: magicString,
    //       };
    //     }

    //     const MagicString = (await import('magic-string')).default;
    //     const ms = new MagicString(code);
    //     ms.replace(RELATIVE_PATH_FOR_WORKSPACE, relativePath);

    //     return {
    //       code: ms.toString(),
    //       map: ms.generateMap({ hires: true }),
    //     };
    //   },
    // },
  };
}
