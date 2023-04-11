import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'nodepack';

export const logger = new TinyLogger(name);

export const NodepackError = createTinyError(name);
