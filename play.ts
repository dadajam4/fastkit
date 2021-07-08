// import { generate } from './packages/icon-font/src/tool';
// import path from 'path';

// const SRC = path.resolve('packages/playground/src/config/icon-font/svg');
// const DEST = path.resolve('test');

// generate({
//   name: 'hoge',
//   inputDir: SRC,
//   outputDir: DEST,
// });
import {
  build,
  axiosErrorResolver,
  fetchResponseResolver,
} from './packages/catcher/src';

const CustomError = build({
  resolvers: [
    axiosErrorResolver,
    fetchResponseResolver,
    (info: { userMessage: string; hoge: boolean }) => {
      return info;
    },
  ],
});

// const err1 = new CustomError({
//   // userMessage: 'aaa',
//   // hoge
//   // us
//   // userMessage: '',

// });
// const err1 = new CustomError(2);

const err = new CustomError({
  // userMessage: 'xxx',
  // hoge: true,
  // c
  // userMessage: 'aaa',
  // hoge: true,
  name: 'xxx',
  message: 'xxx',
  config: {} as unknown as any,
  isAxiosError: true,
  // eslint-disable-next-line @typescript-eslint/ban-types
  toJSON(): object {
    return {};
  },
});

console.log(err.toJSON());
