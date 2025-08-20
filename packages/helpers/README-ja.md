# @fastkit/helpers

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/helpers/README.md) | 日本語

プリミティブな値やオブジェクトを処理するための小さなヘルパー実装のコレクションです。

## 特徴

- **TypeScript完全対応**: 厳密な型定義でタイプセーフな操作を提供
- **軽量**: 必要最小限の依存関係でサイズを最小化
- **多機能**: 文字列、配列、オブジェクト、数値など幅広いデータ型をサポート
- **実用的**: 実際の開発でよく使用される処理を関数化
- **ゼロ依存**: 外部ライブラリに依存せず単体で利用可能

## インストール

```bash
npm install @fastkit/helpers
# or
pnpm add @fastkit/helpers
```

## 基本的な使い方

### 文字列処理

```typescript
import {
  capitalize,
  toHalfWidth,
  stripIndent,
  removeSpace
} from '@fastkit/helpers';

// 最初の文字を大文字化
capitalize('helloWorld'); // → 'HelloWorld'

// 全角文字を半角に変換
toHalfWidth('ＨＥＬＬＯ　ＷＯＲＬＤ'); // → 'HELLO WORLD'

// インデントを正規化
const code = stripIndent(`
  const message = 'Hello';
  console.log(message);
`);

// スペースを除去
removeSpace('Hello World'); // → 'HelloWorld'
```

### 配列操作

```typescript
import {
  arrayUnique,
  arrayRemove,
  range,
  flattenRecursiveArray
} from '@fastkit/helpers';

// 重複を除去
arrayUnique([1, 2, 2, 3, 3]); // → [1, 2, 3]

// 要素を削除（元の配列を変更）
const arr = [1, 2, 3];
arrayRemove(arr, 2); // arr は [1, 3] になる

// 範囲配列を生成
range(3); // → [0, 1, 2]
range(3, 5); // → [5, 6, 7]

// 再帰配列を平坦化
flattenRecursiveArray([1, [2, [3, 4]]]); // → [1, 2, 3, 4]
```

### オブジェクト操作

```typescript
import {
  isPlainObject,
  pickProperties,
  omitProperties,
  removeUndef,
  mixin
} from '@fastkit/helpers';

// プレーンオブジェクトかチェック
isPlainObject({}); // → true
isPlainObject(new Date()); // → false

// プロパティを選択
const obj = { a: 1, b: 2, c: 3 };
pickProperties(obj, ['a', 'c']); // → { a: 1, c: 3 }

// プロパティを除外
omitProperties(obj, ['b']); // → { a: 1, c: 3 }

// undefined プロパティを除去
removeUndef({ a: 1, b: undefined, c: 3 }); // → { a: 1, c: 3 }

// オブジェクトをミックスイン
const base = { a: 1 };
const trait = { b: 2 };
const mixed = mixin(base, trait); // { a: 1, b: 2 }
```

### 型チェック・ユーティリティ

```typescript
import {
  isEmpty,
  notEmptyValue,
  inNonNullable,
  toNumber
} from '@fastkit/helpers';

// 空値チェック
isEmpty(''); // → true
isEmpty([]); // → true
isEmpty(null); // → true
isEmpty('hello'); // → false

// 最初の非空値を取得
notEmptyValue(['', null, 'hello']); // → 'hello'

// null/undefined チェック
inNonNullable(value); // value is not null | undefined

// 数値変換
toNumber('123'); // → 123
toNumber('123.45'); // → 123.45
```

## API

### 文字列処理

#### `capitalize<T extends string>(str: T): Capitalize<T>`
文字列の最初の文字を大文字化

#### `uncapitalize<T extends string>(str: T): Uncapitalize<T>`
文字列の最初の文字を小文字化

#### `toHalfWidth(source: string | null | undefined): string`
全角文字を半角に変換

#### `removeSpace(source: string | null | undefined): string`
全てのスペースとタブ文字を除去

#### `stripIndent(str: string, retainUnnecessaryLines?: boolean): string`
最小インデント数を除去してインデントを正規化

### 配列操作

#### `arrayUnique<T>(array: T[]): T[]`
重複を除去した配列を取得

#### `arrayRemove<T>(array: T[], entry: T): void`
配列から指定要素を削除（破壊的操作）

#### `range(length: number, offset?: number): number[]`
指定された範囲の数値配列を生成

#### `flattenRecursiveArray<T>(source: RecursiveArray<T>): T[]`
再帰的配列を平坦化

### オブジェクト操作

#### `isPlainObject<T>(value: unknown): value is T`
プレーンオブジェクトかどうかを判定

#### `isObject<T>(value: unknown): value is T`
Objectクラスの派生インスタンスかどうかを判定

#### `pickProperties<T, K>(obj: T, props: K[]): Pick<T, K>`
指定したプロパティのみを抽出

#### `omitProperties<T, K>(obj: T, props: K[]): Omit<T, K>`
指定したプロパティを除外

#### `mixin<T, U>(base: T, trait: U): Mixin<T, U>`
オブジェクトをミックスインしたProxyを生成

### 数値操作

#### `toInt(value: string | number): number`
整数値に変換

#### `toFloat(value: string | number): number`
浮動小数点数に変換

#### `toNumber(source: any): number`
数値に正規化

### ユーティリティ

#### `isEmpty(value: any): boolean`
空値かどうかを判定

#### `notEmptyValue<T>(args: T[], defaultValue?: T): T`
配列から最初の非空値を取得

#### `inNonNullable<T>(value: T): value is Exclude<T, null | undefined>`
null/undefinedでないかを判定

## 依存関係

- `@fastkit/ts-type-utils`: TypeScriptの型ユーティリティ（同一リポジトリ内）

## ドキュメント

詳細なドキュメントは[こちら](https://dadajam4.github.io/fastkit/helpers/)をご覧ください。

## ライセンス

MIT
