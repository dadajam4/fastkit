/* eslint-disable no-console */
/**
 * const str
 */
export const CONST_STR = 'const_str';

/**
 * const str alias
 */
export type CONST_STR_ALIAS = typeof CONST_STR;

/**
 * string type
 */
export type STR_TYPE = 'str_type';

/**
 * template str
 */
export const TEMPLATE_STR = `xxx-${CONST_STR}`;

/**
 * const template str
 */
export const CONST_TEMPLATE_STR = `xxx-${CONST_STR}` as const;

/**
 * const num
 */
export const NUM = 0.5;

/**
 * const symbol
 */
export const SYMBOL = Symbol('TEST');

/**
 * symbol type
 */
export type SYMBOL_TYPE = symbol;

/**
 * const date
 */
export const CONST_DATE = new Date();

/**
 * date tipe
 */
export type DATE_TYPE = Date;

/**
 * array
 */
export const ARRAY = [1, 2];

/**
 * const array
 */
export const CONST_ARRAY = [1, 2] as const;

/**
 * const array item
 */
export type CONST_ARRAY_ITEM = (typeof CONST_ARRAY)[number];

/**
 * array type
 */
export type ARRAY_TYPE = (number | string)[];

/**
 * const array type
 */
export type CONST_ARRAY_TYPE = [1, '2', false];

/**
 * const array type item
 */
export type CONST_ARRAY_TYPE_ITEM = CONST_ARRAY_TYPE[number];

/**
 * object array type
 */
export type OBJECT_ARRAY_TYPE = CLASS[];

/**
 * inline union
 */
export type INLINE_UNION_TYPE = '1' | 2 | true;

/**
 * alias union
 */
export type ALIAS_UNION_TYPE =
  | CONST_STR_ALIAS
  | STR_TYPE
  | typeof CONST_TEMPLATE_STR
  | typeof NUM;

/**
 * object type
 */
export type OBJECT_TYPE = {
  /** newシグネチャ */
  new (): number;
  /** シグネチャ */
  (): number;
  /**
   * プロパティメソッドコメント
   * @param bool - ブールコメント
   * @returns りたーんだよ
   */
  readonly propertyMethod?: (bool: boolean) => number;
  /**
   * メソッドだよ
   * @param val - 引数コメント
   * @returns りたーんコメント
   */
  method(val: number): string;
};

/**
 * クラスコメント
 *
 * * これはクラスコメントです。[xxx](http://hoge.com)
 *
 * @FIXME FIXME コメント
 *
 * @see {@link arrowFn なにがし}
 * @see {@link http://hoge.com}
 * @see {@link http://hoge.com なにがし2 ですyp}
 * @see http://hoge.com
 * @see {@link https://hoge.com xxx}
 */
export class CLASS {
  /**
   * 名前
   *
   * @default xxx
   */
  readonly name: string;

  /**
   * nums
   */
  readonly nums: number[];

  /**
   * プライベート
   */
  private privateProperty = 1;

  /**
   * 組み込みDate
   */
  date: Date = new Date();

  /**
   * 再帰型
   */
  parent?: CLASS;

  /** 組み込みシンボル */
  symbol = Symbol('symbol');

  /** 組み込みbigint */
  bigint = BigInt(0);

  /** 組み込みウィンドウ */
  window = window;

  /**
   * ユニオンプロパティ
   */
  unionProperty: 'string' | number | Date = 'string';

  /**
   * ゲッターバリュー
   */
  get getterValue() {
    return this.privateProperty;
  }

  /**
   * セット時のコメント
   */
  set getterValue(xxx) {
    console.log(xxx);
  }

  /**
   * アロー実態
   *
   * @param str - 文字列
   * @returns リターン
   */
  allowFn = (str: string) => str + str;

  /**
   * アロー実態2
   *
   * @param str - 文字列
   * @returns リターン
   */
  readonly allowFn2?: (str: string) => string;

  /**
   * スタティックゲッターバリュー
   */
  static get staticGetterValue() {
    return 2;
  }

  static staticMethod() {
    return true;
  }

  /**
   * コンストラクターコメント
   *
   * @param name - 名前と{@link arrowFn | arrowFn}
   * @param nums - はひひえほ
   * @see {@link arrowFn}
   */
  constructor(name: string, ...nums: number[]) {
    this.name = name;
    this.nums = nums;
  }

  /**
   * メソッドコメント
   *
   * * これはコメントです
   *
   * @returns プラス1して戻す
   */
  fuga(num: number) {
    return num + 1;
  }

  /**
   * オーバーロード1
   * です
   * よ
   *
   * * xxx
   *
   * @param val - number
   */
  overload(val: number): number;

  /**
   * オーバーロード2
   * @param val - number
   */
  overload(val: string): string;

  /**
   * オーバーロード3
   * @param val - number
   */
  overload(val: boolean): void;

  /**
   * オーバーロード実態
   * @param val - number
   */
  overload(val: number | string | boolean): number | string | void {
    return null as any;
  }
}

/**
 * object
 */
export const OBJECT = {
  /**
   * プロップA
   *
   * @see {@link OBJECT_TYPE}
   */
  a: 1,
  b: 'xxx',
  c: new CLASS('hello'),
  propertyMethod: (val: number) => new Date(val),
  memberMethod(val: number) {
    return String(val);
  },
  get getter() {
    return this.b;
  },
};

/**
 * function
 *
 * @remarks これは注意事項です。
 *
 * @param value - 引数1です
 *
 * @returns モック値をreturnします
 */
export function FUNCTION(value: string): typeof OBJECT {
  return null as any;
}

/**
 * functionのboolプロパティ
 */
FUNCTION.prop1 = true;

/**
 * functionのfunctionプロパティ
 */
FUNCTION.prop2 = function fnProp(arg: number): string {
  return String(arg);
};

/**
 * call expression
 */
export const CALL_EXPRESSION = FUNCTION('xxxxx');

/**
 * arrow function
 * @returns true
 */
export const ARROW_FUNCTION = () => true;

/**
 * arrow function type
 */
export type ARROW_FUNCTION_TYPE = () => boolean;

/**
 * interface
 */
export interface INTERFACE {
  a: 1;
  b: boolean;
  c: OBJECT_TYPE;

  memberMethod(): number;
  propertyMethod: () => number;
}

/**
 * has call signature interface
 */
export interface HAS_CALL_SIGUNATURE_INTERFACE {
  /** シグネチャ */
  (): boolean;
  // /** newシグネチャ */
  // new (): number;
  a: 1;
  b: boolean;

  memberMethod(): number;
  propertyMethod: () => number;
}

/**
 * has new signature interface
 */
export interface HAS_NEW_SIGUNATURE_INTERFACE {
  /** シグネチャ */
  (): boolean;
  /** newシグネチャ */
  new (): number;
  a: 1;
  b: boolean;

  memberMethod(): number;
  propertyMethod: () => number;
}

/**
 * has signature interface
 */
export interface HAS_SIGUNATURE_INTERFACE {
  [key: string | number]: string;
}

/**
 * interface keyof
 */
export type INTERFACE_KEYOF = keyof INTERFACE;

/**
 * interface query
 */
export type INTERFACE_QUERY = INTERFACE;

/**
 * record
 */
export type RECORD_TYPE = Record<string, INTERFACE>;

/**
 * intersection type
 */
export type INTERSECTION_TYPE = { a: string } & { b?: boolean };

/**
 * promise type
 */
export type PROMISE_TYPE = Promise<INTERFACE>;

/**
 * generic function
 * @param source - そーす
 * @param args - あーぐす
 * @returns リターン
 */
export function GENERIC_FUNCTION<T, ARGS extends any[]>(
  source: T,
  ...args: ARGS
): // eslint-disable-next-line @typescript-eslint/ban-types
T extends Function ? never : [T, ARGS] {
  return [source, args] as any;
}
