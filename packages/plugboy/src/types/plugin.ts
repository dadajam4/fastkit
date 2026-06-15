import { type TsdownPlugin } from './tsdown';
import type { UserHooks } from './hook';
import type { MaybePromise, NullValue } from './_utils';

export interface Plugin<A = any> extends TsdownPlugin<A> {
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
