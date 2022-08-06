import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'i18n';

export const logger = new TinyLogger(name);

export const I18nError = createTinyError(name);
