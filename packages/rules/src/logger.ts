import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'rules';

export const logger = new TinyLogger(name);

export const RulesError = createTinyError(name);
