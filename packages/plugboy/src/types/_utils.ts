import { PackageJson } from 'pkg-types';

type ObjectLike = Record<string, any>;

export type MarkRequired<
  T extends ObjectLike,
  RequiredField extends keyof T,
> = Required<Pick<T, RequiredField>> & Omit<T, RequiredField>;

export type RequiredPackageJSON<Field extends string> = PackageJson &
  Required<Pick<PackageJson, Field>>;
