/* eslint-disable @typescript-eslint/ban-types */
// import { PropType } from 'vue';

// type ObjectEmitsOptions = Record<string, ((...args: any[]) => any) | null>;
// type EmitsOptions = ObjectEmitsOptions | string[];
// type ExtractEmitEvents<T> = T extends Readonly<Array<infer V>>
//   ? {
//       [K in V & string as `on${Capitalize<K>}`]: PropType<
//         (...args: any[]) => void
//       >;
//     }
//   : T extends any[]
//   ? {
//       [K in T & string as `on${Capitalize<K>}`]: PropType<
//         (...args: any[]) => void
//       >;
//     }
//   : {} extends T
//   ? {}
//   : {
//       [K in keyof T & string as `on${Capitalize<K>}`]: T[K] extends (
//         ...args: infer Args
//       ) => any
//         ? PropType<(...args: Args) => void>
//         : PropType<(...args: any[]) => void>;
//     };

// /**
//  * 以下がリリースされるまでのお茶濁し
//  *
//  * {@link https://github.com/vuejs/vue-next/pull/2164}
//  */
// export function createEmitDefine<Options = EmitsOptions>(options: Options) {
//   return {
//     props: undefined as unknown as ExtractEmitEvents<Options>,
//     emits: options,
//   };
// }
