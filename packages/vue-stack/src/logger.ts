import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'vue-stack';

export const logger = new TinyLogger(name);

export const VueStackError = createTinyError(name);
