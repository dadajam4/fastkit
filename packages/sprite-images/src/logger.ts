import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'sprite-images';

export const logger = new TinyLogger(name);

export const SpriteImagesError = createTinyError(name);
