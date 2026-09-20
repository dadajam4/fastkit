import type { App } from 'vue';
import { VueI18nClient } from '../client';
import type { VueI18nClientSettings } from '../client';

const LOCALES = ['en', 'ja', 'de'] as const;

/**
 * The smallest client that can answer a language question.
 *
 * `getClientLanguage` reads only `settings` and `availableLocales`, and
 * `extractClientLocale` adds `space.resolveLocale` -- so the rest of the space
 * and the vue app are stubs on purpose. Building a real space here would test
 * the space rather than the branch this is about.
 */
export function createClient(settings: VueI18nClientSettings = {}) {
  const space = {
    availableLocales: LOCALES,
    baseLocale: 'en',
    setLocale: () => undefined,
    resolveLocale: (source: string) =>
      LOCALES.find(
        (locale) => locale === source || source.startsWith(`${locale}-`),
      ),
  };

  const app = { config: { globalProperties: {} } } as unknown as App;

  return new VueI18nClient({} as any, app, space as any, settings);
}
