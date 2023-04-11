import { VueI18nStrategyFactory, defineStrategy } from '../../schemes';
import { StorageStrategySettings, DEFAULT_LOCALE_STORAGE_KEY } from './schemes';

/**
 * Create a strategy to save client locale in storage
 * @param settings - Setting up storage-based strategies
 * @returns Storage-based strategy
 */
export function createStorageStrategy(
  settings: StorageStrategySettings = {},
): VueI18nStrategyFactory {
  return defineStrategy((ctx) => {
    const { localeStorageKey = DEFAULT_LOCALE_STORAGE_KEY } = settings;

    return {
      initClient: (client) => {
        const getSavedLocale = () => {
          return client.getStorageValue(localeStorageKey);
        };
        const savedLocale = (localeName: string) => {
          client.setStorageValue(localeStorageKey, localeName);
        };
        const setLocale = async (localeName: string): Promise<void> => {
          await client.setSpaceLocale(localeName);
          savedLocale(localeName);
        };
        const locale = getSavedLocale();

        return {
          locale:
            (locale && client.space.resolveLocale(locale)) || ctx.baseLocale,
          setLocale,
        };
      },
    };
  });
}
