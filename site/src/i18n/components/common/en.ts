import { commonScheme } from './scheme';

export const en = commonScheme.defineLocale.strict({
  translations: (component) => ({
    appName: 'fastkit',
    getStarted: 'Get Started',
  }),
});

export default en;
