export interface MediaMatchDefine<K extends string = string> {
  key: K;
  condition: string;
  description: string;
}
