import { build, axiosErrorResolver } from '@fastkit/catcher';

export const AppError = build({
  resolvers: [axiosErrorResolver],
});
