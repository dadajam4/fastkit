import type { Builder } from '../workspace';

/**
 * Type preservation target in d.ts file
 */
export interface DTSPreserveTypeTarget {
  /** Type name */
  typeName: string;
  /**
   * String to be restored or regular expression to match
   */
  from: string | RegExp;
}

/**
 * Type preservation target in d.ts file (normalized)
 *
 * @see {@link DTSPreserveTypeTarget}
 */
export interface NormalizedDTSPreserveTypeTarget
  extends Omit<DTSPreserveTypeTarget, 'from'> {
  /** Regular expression to match the string to be restored */
  from: RegExp;
}

export function normalizeDTSPreserveTypeTarget(
  target: DTSPreserveTypeTarget,
): NormalizedDTSPreserveTypeTarget {
  const { from, typeName } = target;
  return {
    from: typeof from === 'string' ? new RegExp(`${from}`, 'g') : from,
    typeName,
  };
}

/**
 * Type preservation setting for d.ts files
 *
 * @remarks This setting is for restoring type information inlined by the TypeScript compiler to the original type name by string substitution.
 */
export interface DTSPreserveTypeSettings {
  /** Name of the package to which the type to be restored belongs */
  pkg?: string;
  /** List of preservation targets */
  targets: DTSPreserveTypeTarget[];
}

/**
 * Type preservation setting for d.ts files (normalized)
 *
 * @see {@link DTSPreserveTypeSettings}
 */
export interface NormalizedDTSPreserveTypeSettings
  extends Omit<DTSPreserveTypeSettings, 'targets'> {
  /** List of normalized type preservation targets */
  targets: NormalizedDTSPreserveTypeTarget[];
}

export function normalizeDTSPreserveTypeSettings(
  settings: DTSPreserveTypeSettings,
): NormalizedDTSPreserveTypeSettings {
  return {
    ...settings,
    targets: settings.targets.map(normalizeDTSPreserveTypeTarget),
  };
}

/**
 * Function to normalize d.ts strings
 * @param dts - Bundled d.ts strings
 * @param builder - Builder
 */
export type DTSNormalizer = (
  dts: string,
  builder: Builder,
) => string | undefined | void | Promise<string | undefined | void>;

/**
 * d.ts output setting
 */
export interface DTSSettings {
  /**
   * Inline output without bundling d.ts
   *
   * @default false
   */
  inline?: boolean;

  /**
   * list of type preservation settings
   *
   * @remarks This setting is for restoring type information inlined by the TypeScript compiler to the original type name by string substitution.
   *
   * @see {@link DTSPreserveTypeSettings}
   */
  preserveType?: DTSPreserveTypeSettings[];

  /**
   * list of function to normalize d.ts strings
   */
  normalizers?: DTSNormalizer[];
}

/**
 * d.ts output setting (normalized)
 *
 * @see {@link DTSSettings}
 */
export interface NormalizedDTSSettings {
  /**
   * Inline output without bundling d.ts
   */
  inline: boolean;

  /**
   * list of type preservation settings
   */
  preserveType: NormalizedDTSPreserveTypeSettings[];

  /**
   * list of function to normalize d.ts strings
   */
  normalizers: DTSNormalizer[];
}

export function normalizeDTSSettings(
  settings: DTSSettings,
): NormalizedDTSSettings {
  const {
    inline = false,
    preserveType = [],
    normalizers = [],
  } = settings || {};
  return {
    inline,
    preserveType: preserveType.map(normalizeDTSPreserveTypeSettings),
    normalizers,
  };
}

export function mergeDTSSettingsList(
  ...settingsList: (DTSSettings | undefined)[]
): NormalizedDTSSettings {
  const merged: DTSSettings = {};
  settingsList.forEach((settings) => {
    if (!settings) return;
    const { inline, preserveType, normalizers } = settings;
    if (inline !== undefined) merged.inline = inline;
    if (preserveType) {
      merged.preserveType = merged.preserveType || [];
      merged.preserveType.push(...preserveType);
    }
    if (normalizers) {
      merged.normalizers = merged.normalizers || [];
      merged.normalizers.push(...normalizers);
    }
  });
  return normalizeDTSSettings(merged);
}
