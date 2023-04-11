import { packageExploerI18nScheme } from './scheme';

export default packageExploerI18nScheme.defineLocale.strict({
  translations: {
    scopes: {
      anywhere: {
        name: 'Anywhere',
        description: 'Any execution environment, such as browser, server, etc.',
      },
      node: {
        name: 'Node.js',
        description: 'For Node.js server-side and CLI development.',
      },
      vite: {
        name: 'Vite',
        description: 'Plug-ins for Vite extensions, etc.',
      },
      vot: {
        name: 'Vot',
        description: 'Plug-ins for Vot extensions, etc.',
      },
      vue: {
        name: 'Vue.js',
        description: 'For Vue applications.',
      },
    },
    features: {
      general: {
        name: 'General',
        description: '様々な機能に利用可能な汎用ツール。',
      },
      i18n: {
        name: 'Internationalization',
        description:
          'Support tools for internationalization and multilingualization of applications.',
      },
      color: {
        name: 'Color',
        description: 'Color helper for JS and CSS.',
      },
      file: {
        name: 'File',
        description: 'Helper for file operations.',
      },
      icon: {
        name: 'Icon',
        description: 'Web font icon helper for JS and CSS.',
      },
      ui: {
        name: 'UI & Components',
        description: 'Libraries for building user interfaces.',
      },
      validation: {
        name: 'Validation',
        description:
          'Validate various values such as user input values and communication payloads.',
      },
      image: {
        name: 'Image',
        description: 'Helper library for images.',
      },
      log: {
        name: 'Log',
        description: 'Library for log generation and output.',
      },
      framework: {
        name: 'Framework',
        description:
          'A framework for the overall construction of an application.',
      },
    },
    header: {
      name: 'Package Name',
      scope: 'Scope',
      feature: 'Feature',
      description: 'Description',
    },
  },
});
