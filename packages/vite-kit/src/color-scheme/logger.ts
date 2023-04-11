import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'vite:color-scheme';

export const logger = new TinyLogger(name);

export const ViteColorSchemeError = createTinyError(name);
