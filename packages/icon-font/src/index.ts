export interface IconNameMap {} // eslint-disable-line @typescript-eslint/no-empty-interface

// eslint-disable-next-line @typescript-eslint/ban-types
type ExtractKeys<T extends object> = keyof T extends never ? string : keyof T;

export type IconName = ExtractKeys<IconNameMap>;

export const ICON_NAMES = [] as IconName[];

export function registerIconNames(icons: IconName[]) {
  ICON_NAMES.push(...icons);
  return ICON_NAMES;
}
