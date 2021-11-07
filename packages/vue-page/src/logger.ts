import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'vue-page';

export const logger = new TinyLogger(name);

export const VuePageError = createTinyError(name);
