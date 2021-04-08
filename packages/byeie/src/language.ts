export function getBrowserLanguage(defaultLanguage = 'en-US') {
  if (!__BROWSER__) return defaultLanguage;
  const browserLanguage: string =
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    (navigator as any).userLanguage ||
    (navigator as any).browserLanguage;
  return (browserLanguage || defaultLanguage).toLowerCase();
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
    case 'en-us':
      result = 'en';
      break;
    // 日本語
    case 'ja':
    case 'ja-jp':
      result = 'ja';
      break;
    // 簡体字
    case 'zh-cn':
    case 'zh-hans':
    case 'zh-sg':
      result = 'zh-cn';
      break;
    // 繁体字
    case 'zh-hant':
    case 'zh-mo':
    case 'zh-hk':
    case 'zh-tw':
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
