// export type { MediaMatchDefine } from '@fastkit/media-match';
export interface MediaMatchDefine<K extends string = string> {
  key: K;
  condition: string;
  description: string;
}

export interface MediaMatchBreakpoint<K extends string = string> {
  key: K;
  min: number;
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

export interface MediaMatchSettings<
  K extends string = string,
  C extends string = string,
> {
  breakpoints: MediaMatchBreakpoint<K>[];
  customs: MediaMatchCustom<C>[];
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
  };
  return _settings;
}
