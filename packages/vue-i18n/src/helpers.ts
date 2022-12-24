import { reactive } from 'vue';
import { createI18nObjectStorage } from '@fastkit/i18n';

/**
 * Generate a reactive storage interface.
 * @returns Storage Interface
 */
export function createVueI18nObjectStorage() {
  return createI18nObjectStorage(reactive({}));
}
