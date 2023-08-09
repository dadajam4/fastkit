import { scheme } from './scheme';

export const en = scheme.defineLocale.strict({
  translations: {
    concept: {
      title: 'Concept',
      content: () => (
        <>
          Most logger libraries for JavaScript are designed to work on the
          server side, such as NodeJS, and there were not many for the browser
          environment.
          <br />
          This library was created because we needed a library that could work
          universally on the browser & server side, that could plug in log
          transforms and multiple transport settings, and that was still
          lightweight.
          <br />
          <br />
          It offers the basic functions of a logger and several built-in
          transformers and transporters.
        </>
      ),
    },
    define: {
      title:
        'Define logger to match the logging requirements of your application',
    },
    use: {
      title: 'Use logger',
    },
  },
});

export default en;
