import { AvairableLanguage, getAvairableLanguage } from './language';

export interface Dict {
  $lang: AvairableLanguage;
  title: string;
  lead: string;
  note: string;
  expired: {
    title: string;
    lead: string;
  };
  installation: {
    title: string;
  };
  browser: {
    edge: { name: string; href: string };
    chrome: { name: string; href: string };
    firefox: { name: string; href: string };
  };
}

export const dictMap: Record<AvairableLanguage, Omit<Dict, '$lang'>> = {
  en: {
    title: 'xxx',
    lead: 'xxx',
    note: 'xxx',
    expired: {
      title: 'xxx',
      lead: 'xxx',
    },
    installation: {
      title: 'xxx',
    },
    browser: {
      edge: {
        name: 'Microsoft Edge',
        href: 'https://www.microsoft.com/edge',
      },
      chrome: {
        name: 'Google Chrome',
        href: 'https://www.google.com/chrome/',
      },
      firefox: {
        name: 'Mozilla Firefox',
        href: 'https://www.mozilla.org/en-US/firefox/',
      },
    },
  },
  ja: {
    title:
      '本ウェブサイトにおけるお使いのブラウザ（Internet Explorer）のサポートを <%- deadline %> に終了します。',
    lead: '快適に本サイトをご利用頂けるよう、より高速で安全な Internet Explorer の後継ブラウザである Microsoft Edge をご利用いただくか、Google Chrome や Mozilla Firefox など、他社製ブラウザのご利用をお願いいたします。',
    note: '※ Microsoft Edge は Windows Update により配信されています。',
    expired: {
      title:
        '本ウェブサイトにおけるお使いのブラウザ（Internet Explorer）のサポートを <%- deadline %> に終了しました。',
      lead: 'より高速で安全な Internet Explorer の後継ブラウザである Microsoft Edge をご利用いただくか、Google Chrome や Mozilla Firefox など、他社製ブラウザのご利用をお願いいたします。',
    },
    installation: {
      title: '推奨ブラウザ・インストール',
    },
    browser: {
      edge: {
        name: 'Microsoft Edge',
        href: 'https://www.microsoft.com/ja-jp/edge',
      },
      chrome: {
        name: 'Google Chrome',
        href: 'https://www.google.com/intl/ja_jp/chrome/',
      },
      firefox: {
        name: 'Mozilla Firefox',
        href: 'https://www.mozilla.org/firefox/',
      },
    },
  },
  ko: {
    title: 'xxx',
    lead: 'xxx',
    note: 'xxx',
    expired: {
      title: 'xxx',
      lead: 'xxx',
    },
    installation: {
      title: 'xxx',
    },
    browser: {
      edge: {
        name: 'Microsoft Edge',
        href: 'https://www.microsoft.com/ko-kr/edge',
      },
      chrome: {
        name: 'Google Chrome',
        href: 'https://www.google.com/intl/ko/chrome/',
      },
      firefox: {
        name: 'Mozilla Firefox',
        href: 'https://www.mozilla.org/ko/firefox/',
      },
    },
  },
  'zh-cn': {
    title: 'xxx',
    lead: 'xxx',
    note: 'xxx',
    expired: {
      title: 'xxx',
      lead: 'xxx',
    },
    installation: {
      title: 'xxx',
    },
    browser: {
      edge: {
        name: 'Microsoft Edge',
        href: 'https://www.microsoft.com/zh-cn/edge',
      },
      chrome: {
        name: 'Google Chrome',
        href: 'https://www.google.com/intl/zh-CN/chrome/',
      },
      firefox: {
        name: 'Mozilla Firefox',
        href: 'https://www.mozilla.org/zh-CN/firefox/',
      },
    },
  },
  'zh-tw': {
    title: 'xxx',
    lead: 'xxx',
    note: 'xxx',
    expired: {
      title: 'xxx',
      lead: 'xxx',
    },
    installation: {
      title: 'xxx',
    },
    browser: {
      edge: {
        name: 'Microsoft Edge',
        href: 'https://www.microsoft.com/zh-tw/edge',
      },
      chrome: {
        name: 'Google Chrome',
        href: 'https://www.google.com/intl/zh-TW/chrome/',
      },
      firefox: {
        name: 'Mozilla Firefox',
        href: 'https://www.mozilla.org/zh-TW/firefox/',
      },
    },
  },
};

export function getLanguageDict(): Dict {
  const $lang = getAvairableLanguage();
  return {
    $lang,
    ...dictMap[$lang],
  };
}
