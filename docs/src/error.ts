import {
  build,
  axiosErrorResolver,
  fetchResponseResolver,
} from '@fastkit/catcher';

interface Normalized {
  name?: string;
  status: number;
  message: string;
}

// build({
//   // defaultName: 'acco-cms-admin-front-error',
//   resolvers: [axiosErrorResolver],
//   normalizer: (fuga) => {
//     return (info: { hoge: number }): Normalized => {
//       return {
//         name: '',
//         status: 400,
//         message: '',
//       };
//     };
//   },
// });
// const normalizer = createCatcherNomalizer(
//   (_fuga) => {
//     return (hoge: { hoge: number }): Normalized => {
//       return {} as any;
//     };
//   },
//   [axiosErrorResolver],
// );

export class AppError extends build({
  // defaultName: 'acco-cms-admin-front-error',
  resolvers: [axiosErrorResolver, fetchResponseResolver],
  normalizer: (fuga) => {
    return (hoge: { aaa: number; bbb: string; xxx: boolean }): Normalized => {
      return {} as any;
    };
  },
}) {}
