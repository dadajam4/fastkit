import { AvairableLanguage, getAvairableBrowserLanguage } from './language';

export interface Dict {
  title: string;
  lead: string;
  note: string;
  installation: {
    title: string;
  };
}

export const dictMap: Record<AvairableLanguage, Dict> = {
  en: {
    title: 'xxx',
    lead: 'xxx',
    note: 'xxx',
    installation: {
      title: 'xxx',
    },
  },
  ja: {
    title: 'xxx',
    lead: 'xxx',
    note: 'xxx',
    installation: {
      title: 'xxx',
    },
  },
  ko: {
    title: 'xxx',
    lead: 'xxx',
    note: 'xxx',
    installation: {
      title: 'xxx',
    },
  },
  'zh-cn': {
    title: 'xxx',
    lead: 'xxx',
    note: 'xxx',
    installation: {
      title: 'xxx',
    },
  },
  'zh-tw': {
    title: 'xxx',
    lead: 'xxx',
    note: 'xxx',
    installation: {
      title: 'xxx',
    },
  },
};

export function getBrowserLanguageDict() {
  return dictMap[getAvairableBrowserLanguage()];
}
