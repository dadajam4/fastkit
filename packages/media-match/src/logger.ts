import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'media-match';

export const logger = new TinyLogger(name);

export const MediaMatchError = createTinyError(name);
