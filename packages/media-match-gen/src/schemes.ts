// export type { MediaMatchDefine } from '@fastkit/media-match';
export interface MediaMatchDefine<K extends string = string> {
  key: K;
  condition: string;
  description: string;
}

/**
 * breakpointsで定義したキーは
 * [key]AndDown
 * [key]AndUp
 * の条件も自動生成されます。
 */
export interface MediaMatchBreakpoint<K extends string = string> {
  key: K;
  min?: number;
  max?: number;
  description?: string;
}

/**
 * mediaMatchCustomsで定義したキーは
 * この条件のみが設定されます。
 */
export interface MediaMatchCustom<C extends string> {
  key: C;

  /**
   * ex. "(max-width:320px)"
   */
  condition: string;
  description?: string;
}

export type ComputedMediaMatchKey<K extends string> =
  | K
  | `${K}AndDown`
  | `${K}AndUp`;

/**
 * 特定の条件に別名でも参照したい時に設定してください。
 */
export interface MediaMatchAliases<K extends string, C extends string> {
  [key: string]: ComputedMediaMatchKey<K> | C;
}

export interface MediaMatchSettings<
  K extends string = string,
  C extends string = string,
> {
  breakpoints: MediaMatchBreakpoint<K>[];
  customs: MediaMatchCustom<C>[];
  aliases: MediaMatchAliases<K, C>;
  setAlias(aliasSettings: MediaMatchAliases<K, C>): this;
}

export function createMediaMatchSettings<
  K extends string,
  C extends string,
>(settings: {
  breakpoints: MediaMatchBreakpoint<K>[];
  customs?: MediaMatchCustom<C>[];
}): MediaMatchSettings<K, C> {
  const { breakpoints, customs = [] } = settings;
  const _settings: MediaMatchSettings<K, C> = {
    breakpoints,
    customs,
    aliases: {},
    setAlias(aliasSettings) {
      this.aliases = {
        ...this.aliases,
        ...aliasSettings,
      };
      return this;
    },
  };
  return _settings;
}
