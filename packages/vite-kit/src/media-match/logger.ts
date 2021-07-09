import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'vite:media-match';

export const logger = new TinyLogger(name);

export const ViteMediaMatchError = createTinyError(name);
