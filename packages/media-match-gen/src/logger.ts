import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'media-match-gen';

export const logger = new TinyLogger(name);

export const MediaMatchGenError = createTinyError(name);
