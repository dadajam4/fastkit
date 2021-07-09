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
    title:
      'Support for the Internet Explorer browser on this website will end on <%- deadline %>.',
    lead: 'For the best viewing experience, we recommend using Google Chrome, Morzilla Firefox, or Microsoft Edge, the successor browser to Internet Explorer, which is a faster and more secure alternative.',
    note: '* Microsoft Edge is distributed by Windows Update.',
    expired: {
      title:
        'Support for the Internet Explorer browser on this website has ended on <%- deadline %> .',
      lead: 'For the best viewing experience, we recommend using Google Chrome, Morzilla Firefox, or Microsoft Edge, the successor browser to Internet Explorer, which is a faster and more secure alternative.',
    },
    installation: {
      title: 'Browser Recommendation',
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
    title:
      '본 웹 사이트에서 사용 중인 브라우저 (Internet Explorer)의 지원을 <%- deadline %>에 종료합니다.',
    lead: '더 빠르고 안전한 Internet Explorer의 후속 브라우저인 Microsoft Edge를 이용하시거나 Google Chrome 및 Mozilla Firefox 등 타사 브라우저를 이용해 주시기 바랍니다.',
    note: '※ Microsoft Edge는 Windows Update 이후 이용하실 수 있습니다.',
    expired: {
      title:
        '본 웹 사이트에서 사용 중인 브라우저 (Internet Explorer)의 지원을 <%- deadline %>에 종료했습니다.',
      lead: '더 빠르고 안전한 Internet Explorer의 후속 브라우저인 Microsoft Edge를 이용하시거나 Google Chrome 및 Mozilla Firefox 등 타사 브라우저를 이용해 주시기 바랍니다.',
    },
    installation: {
      title: '권장 브라우저 설치',
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
    title: '此网站已于<%- deadline %>停止提供对IE浏览器相关的支持服务。',
    lead: '为了您能够继续舒适地浏览此网站，我们建议您安装更为高速和安全的IE后继版本的Microsoft Edge浏览器，也可以选择使用Google Chrome或者Mozilla Firefox等其他公司的浏览器。',
    note: '※ Microsoft Edge 可以通过 Windows Update 进行安装',
    expired: {
      title: '此网站已于<%- deadline %>停止提供对IE浏览器相关的支持服务。',
      lead: '我们建议您安装更为高速和安全的IE后继版本的Microsoft Edge浏览器，也可以选择使用Google Chrome或者Mozilla Firefox等其他公司的浏览器。',
    },
    installation: {
      title: '推荐的浏览器及安装方法',
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
    title: '此網站已於<%- deadline %>停止提供對IE瀏覽器相關的支持服務。',
    lead: '為了您能夠繼續舒適地瀏覽此網站，我們建議您安裝更為高速和安全的IE後繼版本的Microsoft Edge瀏覽器，也可以選擇使用Google Chrome或者Mozilla Firefox等其他公司的瀏覽器。',
    note: '※ Microsoft Edge 可以通過 Windows Update 進行安裝',
    expired: {
      title: '此網站已於<%- deadline %>停止提供對IE瀏覽器相關的支持服務。',
      lead: '為了您能夠繼續舒適地瀏覽此網站，我們建議您安裝更為高速和安全的IE後繼版本的Microsoft Edge瀏覽器，也可以選擇使用Google Chrome或者Mozilla Firefox等其他公司的瀏覽器。',
    },
    installation: {
      title: '推薦的瀏覽器及安裝方法',
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
