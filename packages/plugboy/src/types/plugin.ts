import { RolldownPlugin } from './rolldown';
import type { UserHooks } from './hook';
import type { MaybePromise, NullValue } from './_utils';

export interface Plugin<A = any> extends RolldownPlugin<A> {
  hooks?: UserHooks;
}

export type UserPluginOption<A = any> = MaybePromise<
  | NullValue<Plugin<A>>
  | {
      name: string;
    }
  | false
  | UserPluginOption[]
>;
