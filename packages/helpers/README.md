
# @fastkit/helpers

🌐 English | [日本語](./README-ja.md)

A collection of small helper implementations for processing primitive values and objects.

## Features

- **Full TypeScript Support**: Provides type-safe operations with strict type definitions
- **Lightweight**: Minimized size with minimal necessary dependencies
- **Multi-functional**: Supports a wide range of data types including strings, arrays, objects, and numbers
- **Practical**: Functions commonly used operations in actual development
- **Zero Dependencies**: Can be used standalone without depending on external libraries

## Installation

```bash
npm install @fastkit/helpers
# or
pnpm add @fastkit/helpers
```

## Basic Usage

### String Processing

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

### String Processing

#### `capitalize<T extends string>(str: T): Capitalize<T>`
Capitalizes the first character of a string

#### `uncapitalize<T extends string>(str: T): Uncapitalize<T>`
Uncapitalizes the first character of a string

#### `toHalfWidth(source: string | null | undefined): string`
Converts full-width characters to half-width

#### `removeSpace(source: string | null | undefined): string`
Removes all spaces and tab characters

#### `stripIndent(str: string, retainUnnecessaryLines?: boolean): string`
Normalizes indentation by removing the minimum indent count

### Array Operations

#### `arrayUnique<T>(array: T[]): T[]`
Returns array with duplicates removed

#### `arrayRemove<T>(array: T[], entry: T): void`
Removes specified element from array (destructive operation)

#### `range(length: number, offset?: number): number[]`
Generates numeric array of specified range

#### `flattenRecursiveArray<T>(source: RecursiveArray<T>): T[]`
Flattens recursive array

### Object Operations

#### `isPlainObject<T>(value: unknown): value is T`
Determines whether value is a plain object

#### `isObject<T>(value: unknown): value is T`
Determines whether value is an instance derived from Object class

#### `pickProperties<T, K>(obj: T, props: K[]): Pick<T, K>`
Extracts only specified properties

#### `omitProperties<T, K>(obj: T, props: K[]): Omit<T, K>`
Excludes specified properties

#### `mixin<T, U>(base: T, trait: U): Mixin<T, U>`
Generates a Proxy that mixes objects

### Number Operations

#### `toInt(value: string | number): number`
Converts to integer value

#### `toFloat(value: string | number): number`
Converts to floating-point number

#### `toNumber(source: any): number`
Normalizes to number

### Utilities

#### `isEmpty(value: any): boolean`
Determines whether value is empty

#### `notEmptyValue<T>(args: T[], defaultValue?: T): T`
Returns first non-empty value from array

#### `inNonNullable<T>(value: T): value is Exclude<T, null | undefined>`
Determines whether value is not null or undefined

## Dependencies

- `@fastkit/ts-type-utils`: TypeScript type utilities (within same repository)

## Documentation

For detailed documentation, please visit [here](https://dadajam4.github.io/fastkit/helpers/).

## License

MIT
