export function getBrowserLanguage(defaultLanguage = 'en-US') {
  if (!__BROWSER__) return defaultLanguage;
  const browserLanguage: string =
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    (navigator as any).userLanguage ||
    (navigator as any).browserLanguage;
  return browserLanguage || defaultLanguage;
}

export type AvairableLanguage = 'en' | 'ja' | 'ko' | 'zh-cn' | 'zh-tw';

export function getAvairableBrowserLanguage(
  defaultLanguage: AvairableLanguage = 'en',
) {
  let result = defaultLanguage;
  const browserLanguage = getBrowserLanguage();
  switch (browserLanguage) {
    // 英語
    case 'en':
    case 'en-US':
      result = 'en';
      break;
    // 簡体字
    case 'zh-CN':
    case 'zh-Hans':
    case 'zh-SG':
      result = 'zh-cn';
      break;
    // 繁体字
    case 'zh-Hant':
    case 'zh-MO':
    case 'zh-HK':
    case 'zh-TW':
      result = 'zh-tw';
      break;
    // 繁体字
    case 'ko':
      result = 'ko';
      break;
    default:
      break;
  }
  return result;
}
