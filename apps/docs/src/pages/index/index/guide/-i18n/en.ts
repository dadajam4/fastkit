import { scheme } from './scheme';

export const en = scheme.defineLocale.strict({
  translations: {
    motivation: {
      title: 'Motivation',
      body: `
        When creating an application, this is a concern in the selection of third-party libraries.

        - Low affinity with TypeScript (recently decreasing)
        - Native ESM support is not provided.
        - Depends on browser, Node, or other runtime and does not work well
        - Many similar functions exist in the dependencies, increasing the bundle size.

        This is a small group of toolkits that the [maintainer](https://github.com/dadajam4) has begun to grow to eliminate the time spent worrying about such things and to quickly begin development of the application itself.
      `,
    },
    feature: {
      title: 'Feature',
      body: `
        - High affinity with TypeScript
        - Full Native ESM support
        - Works universally in different execution environments such as browsers, servers, extensions, etc.
        - Biased toward Vue.js due to maintainer habitat
      `,
    },
    thanks: `
      The npm repository contains many well-tested and quality packages, and I am grateful for them every day.
      I only put here what the maintainer needs, but if I can support your development, that makes me happy.
    `,
    contributing: {
      title: 'Contributing',
      body: `
        Fastkit is maintained outside of the maintainer's daily business hours, so a quick response may be difficult, but bug reports and feature requests are welcome.
        I believe your [feedback](https://github.com/dadajam4/fastkit/issues) will make this tool better.

        Contributions to the Code are also welcome.
        Please read [this guide](https://github.com/dadajam4/fastkit/blob/main/CONTRIBUTING.md) and submit a pull request.
      `,
    },
    installation: {
      description: `
        Find what you need for your application and install them individually.

        Find the feature you are looking for [here](/packages/).
      `,
    },
    optimization: {
      title: 'Optimization',
      description: `
        The internal packages of the Fastkit project are divided into smaller packages and dependencies to avoid duplicate functionality as much as possible.
        When adding new packages or upgrading packages, please keep all packages as up-to-date as possible.
      `,
      npm: `
        Tools such as [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) can be used for bulk updates.
      `,
    },
    packages: {
      title: 'Package Composition',
      description: `
        Fastkit is divided into a Vanilla JS implementation that can be used in a variety of situations and a plugin implementation for use with commonly used frameworks and libraries.
        Use the explorer to find the tools you need.
      `,
    },
  },
});

export default en;
