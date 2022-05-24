import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'async-control';

export const logger = new TinyLogger(name);

export const ColorSchemeError = createTinyError(name);
