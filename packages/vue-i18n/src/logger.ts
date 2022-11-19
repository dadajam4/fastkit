import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'vue-i18n';

export const logger = new TinyLogger(name);

export const VueI18nError = createTinyError(name);
