import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'icon-font-gen';

export const logger = new TinyLogger(name);

export const IconFontGenError = createTinyError(name);
