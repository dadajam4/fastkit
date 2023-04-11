import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'hashed-sync';

export const logger = new TinyLogger(name);

export const HashedSyncError = createTinyError(name);
