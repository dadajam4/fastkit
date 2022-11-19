export type I18nStorageAnyData = { [key: string]: any };

/**
 * Configurable storage interface for internationalization services
 *
 * * Any other specification is acceptable as long as it has get and set interfaces
 * * By registering a reactive interface provided by React, Vue, etc., it is possible to link the state of the UI with the processing state of the internationalization service.
 */
export interface I18nStorage<
  Data extends I18nStorageAnyData = I18nStorageAnyData,
> {
  /** Obtains the value corresponding to the specified key */
  get<Key extends keyof Data>(key: Key): Data[Key];

  /** Sets the value corresponding to the specified key */
  set<Key extends keyof Data>(key: Key, value: Data[Key]): void;
}

/**
 * Configurable storage interface factory for internationalization services
 *
 * @see I18nStorage
 */
export type I18nStorageFactory<
  Data extends I18nStorageAnyData = I18nStorageAnyData,
> = () => I18nStorage<Data>;

/**
 * Configurable storage interface for internationalization services, or a factory for it
 */
export type I18nStorageOrFactory<
  Data extends I18nStorageAnyData = I18nStorageAnyData,
> = I18nStorage<Data> | I18nStorageFactory<Data>;

/**
 * Generate a storage interface with the specified object as the bucket for data storage
 *
 * @param obj - bucket for data storage
 * @returns Storage Interface
 */
export function createI18nObjectStorage<
  Data extends I18nStorageAnyData = I18nStorageAnyData,
>(obj: any = {}): I18nStorage<Data> {
  const storage: I18nStorage<Data> = {
    get: (key) => obj[key],
    set: (key, value) => {
      obj[key] = value;
    },
  };
  return storage;
}
