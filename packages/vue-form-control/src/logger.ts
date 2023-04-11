import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'vue-form-control';

export const logger = new TinyLogger(name);

export const VueFormControlError = createTinyError(name);
