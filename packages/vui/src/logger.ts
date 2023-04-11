import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'vui';

export const logger = new TinyLogger(name);

export const VuiError = createTinyError(name);
