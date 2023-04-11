import { TinyLogger, createTinyError } from '@fastkit/tiny-logger';

const name = 'vite-plugin-vui';

export const logger = new TinyLogger(name);

export const VitePluginVuiError = createTinyError(name);
