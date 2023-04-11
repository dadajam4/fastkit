import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'node-util';

export const logger = new TinyLogger(name);

export const NodeUtilError = createTinyError(name);
