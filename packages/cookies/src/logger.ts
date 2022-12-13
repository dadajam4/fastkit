import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'cookies';

export const logger = new TinyLogger(name);

export const CookiesError = createTinyError(name);
