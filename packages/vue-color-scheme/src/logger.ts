import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'vue-color-scheme';

export const logger = new TinyLogger(name);

export const ColorSchemeError = createTinyError(name);
