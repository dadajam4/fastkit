export interface MediaMatchCondition {
  key: string;
  condition: string;
  description: string;
}

/**
 * breakPointsで定義したキーは
 * [key]AndDown
 * [key]AndUp
 * の条件も自動生成されます。
 */
export interface MediaMatchBreakPoint<K extends string = string> {
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
  breakPoints: MediaMatchBreakPoint<K>[];
  customs: MediaMatchCustom<C>[];
  aliases: MediaMatchAliases<K, C>;
  setAlias(aliasSettings: MediaMatchAliases<K, C>): this;
}

export function createMediaMatchSettings<
  K extends string,
  C extends string,
>(settings: {
  breakPoints: MediaMatchBreakPoint<K>[];
  customs?: MediaMatchCustom<C>[];
}): MediaMatchSettings<K, C> {
  const { breakPoints, customs = [] } = settings;
  const _settings: MediaMatchSettings<K, C> = {
    breakPoints,
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

// const hoge = createMediaMatchSettings({
//   breakPoints: [
//     {
//       key: 'xs',
//       max: 575,
//       description: 'Phone (Narrow)',
//     },
//     {
//       key: 'sm',
//       max: 767,
//       description: 'Phone',
//     },
//     {
//       key: 'md',
//       max: 1023,
//       description: 'Console or Tablet',
//     },
//     {
//       key: 'lg',
//       min: 1024,
//       description: 'Console (Wide)',
//     },
//   ],
//   customs: [
//     {
//       key: 'xxs',
//       condition: '(max-width:320px)',
//       description: 'Very narrow device',
//     },
//   ],
// }).setAlias({
//   narrow: 'smAndDown',
//   wide: 'mdAndUp',
// });
