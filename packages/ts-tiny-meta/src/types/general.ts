export type Callable = (...args: any) => any;

export type ClassType = {
  new (...args: any): any;
};

export type ObjectLike = Record<keyof any, any>;

export type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

export type ExtractMembers<T extends ObjectLike, V = never> = Required<{
  [K in keyof T]: V extends never ? T[K] : V;
}>;
