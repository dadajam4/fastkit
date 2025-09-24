export interface IconNameMap {}

type ExtractKeys<T extends object, D> = keyof T extends never ? D : keyof T;

export type IconName = ExtractKeys<IconNameMap, '__IconName__'>;

export const ICON_NAMES = [] as IconName[];

export function registerIconNames(icons: IconName[]) {
  ICON_NAMES.push(...icons);
  return ICON_NAMES;
}
