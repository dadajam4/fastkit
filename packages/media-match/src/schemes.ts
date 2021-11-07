export interface MediaMatchKeyMap {} // eslint-disable-line @typescript-eslint/no-empty-interface

// eslint-disable-next-line @typescript-eslint/ban-types
type ExtractKeys<T extends object, D> = keyof T extends never ? D : keyof T;

export type MediaMatchKey = ExtractKeys<MediaMatchKeyMap, '__MediaMatchKey__'>;

export interface MediaMatchCondition {
  key: MediaMatchKey;
  condition: string;
  description: string;
}

export const MEDIA_MATCH_CONDITIONS = [] as MediaMatchCondition[];

export function registerMediaMatchConditions(
  conditions: MediaMatchCondition[],
) {
  MEDIA_MATCH_CONDITIONS.push(...conditions);
  return MEDIA_MATCH_CONDITIONS;
}
