import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'icon-font';

export const logger = new TinyLogger(name);

export const IconFontError = createTinyError(name);
