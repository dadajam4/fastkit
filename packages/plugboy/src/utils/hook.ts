import {
  UserHooks,
  ResolvedHooks,
  BuildedHooks,
  createHooksDefaults,
} from '../types';
import { resolveListable } from './general';

export async function resolveUserHooks(
  ...userHooks: (UserHooks | undefined | null | false)[]
): Promise<ResolvedHooks> {
  const hooks = createHooksDefaults();
  if (!userHooks) return hooks;
  for (const userHook of userHooks) {
    if (!userHook) continue;
    for (const [hookName, _hooks] of Object.entries(userHook)) {
      if (hooks) {
        (hooks as any)[hookName].push(...(await resolveListable(_hooks)));
      }
    }
  }
  return hooks;
}

export function buildHooks(resolvedHooks: ResolvedHooks): BuildedHooks {
  const hooks: any = {};
  Object.entries(resolvedHooks).forEach(([hookName, fns]) => {
    hooks[hookName] = async (...args: any[]): Promise<any> => {
      const results: any[] = [];
      for (const fn of fns) {
        results.push(await (fn as any)(...args));
      }
      return results;
    };
  });
  return hooks;
}
