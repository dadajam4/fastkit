import { computed, ComputedRef } from 'vue';
import { useParentDocsSection, provideDocsSection } from './injections';

export type VDocsSectionLevel = 2 | 3 | 4;

export interface VDocsSectionContextSettings {
  level: () => VDocsSectionLevel | undefined;
  id: () => string | undefined;
  title: () => string;
}

const connectingCharacterRe = /[\s\t\n\r]+/g;
const specialCharacterRe = /[\!\?]/g;

function titleToId(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(connectingCharacterRe, '-')
    .replace(specialCharacterRe, '');
}

export class VDocsSectionContext {
  readonly parent: VDocsSectionContext | null;
  readonly settings: VDocsSectionContextSettings;
  private _id: ComputedRef<string>;
  private _level: ComputedRef<VDocsSectionLevel>;

  constructor(settings: VDocsSectionContextSettings) {
    const parent = useParentDocsSection();
    this.parent = parent;
    this.settings = settings;

    this._level = computed(() => {
      const settingsLevel = settings.level();
      if (settingsLevel) return settingsLevel;

      const parentLevel = parent && parent.level();

      const level: VDocsSectionLevel =
        parentLevel == null
          ? 2
          : parentLevel === 4
          ? 4
          : ((parentLevel + 1) as VDocsSectionLevel);
      return level;
    });

    this._id = computed(() => {
      const parentId = parent && parent.id();
      const prefix = parentId ? `${parentId}_` : '';

      let id = settings.id();

      if (!id) {
        id = titleToId(settings.title());
      }

      return `${prefix}${id}`;
    });

    this.id = this.id.bind(this);
    this.level = this.level.bind(this);
  }

  id() {
    return this._id.value;
  }

  level() {
    return this._level.value;
  }
}

export function useDocsSection(
  settings: VDocsSectionContextSettings,
): VDocsSectionContext {
  const ctx = new VDocsSectionContext(settings);

  provideDocsSection(ctx);

  return ctx;
}
