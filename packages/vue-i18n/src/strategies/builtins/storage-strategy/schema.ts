/** Default value of storage key to store client locale */
export const DEFAULT_LOCALE_STORAGE_KEY = 'vi18n_locale';

/**
 * Setting up storage-based strategies
 */
export interface StorageStrategySettings {
  /**
   * Storage key to store client locale
   *
   * @default "vi18n_locale"
   * @see {@link DEFAULT_LOCALE_STORAGE_KEY}
   */
  localeStorageKey?: string;
}
