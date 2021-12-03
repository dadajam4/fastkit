import { build, axiosErrorResolver } from '@fastkit/catcher';

export class AppError extends build({
  // defaultName: 'acco-cms-admin-front-error',
  resolvers: [axiosErrorResolver],
  normalizers: [],
}) {
  static from(source: unknown): AppError {
    if (source instanceof AppError) {
      return source;
    }
    return new AppError(source);
  }
}

// export const AppError = build({
//   // defaultName: 'acco-cms-admin-front-error',
//   resolvers: [axiosErrorResolver],
//   normalizers: [],
// });
