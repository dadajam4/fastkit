import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'vite-kit';

export const logger = new TinyLogger(name);

export const ViteKitError = createTinyError(name);
