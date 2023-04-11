import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'color-scheme-gen';

export const logger = new TinyLogger(name);

export const ColorSchemeGenError = createTinyError(name);
