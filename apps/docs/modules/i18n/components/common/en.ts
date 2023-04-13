import { commonScheme } from './scheme';

export const en = commonScheme.defineLocale.strict({
  translations: (component) => ({
    appName: 'Fastkit',
    guide: 'Guide',
    whatIsFastkit: 'What is Fastkit?',
    howToUse: 'How to use',
    installation: 'Installation',
    translations: 'Translations',
    copied: 'Copied',
    packages: 'Packages',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    all: 'All',
    usage: 'Usage',
    docIsInPreparation: 'Documentation is in preparation.',
  }),
});

export default en;
