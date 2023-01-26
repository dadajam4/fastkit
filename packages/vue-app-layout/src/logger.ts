import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'vue-app-layout';

export const logger = new TinyLogger(name);

export const VueAppLayoutError = createTinyError(name);
