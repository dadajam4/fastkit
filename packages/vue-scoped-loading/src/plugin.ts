import { type App } from 'vue';
import { initLoadingScope } from './loading-scope';

/**
 * Add a global loading scope to the Vue application
 *
 * @param app - Vue application
 * @returns Root loading scope
 */
export function installVueScopedLoading(app: App) {
  return initLoadingScope(app);
}
