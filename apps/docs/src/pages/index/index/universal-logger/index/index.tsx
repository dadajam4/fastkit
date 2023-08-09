import { defineComponent } from 'vue';
import { VDocsSection, VCode, VDocsPaging } from '~/components';
import { PackageProvide } from '@@/package-loader';
import { PkgI18nSubSpace } from '../index';

export default defineComponent({
  setup() {
    const pkg = PackageProvide.use();
    pkg.useHead();
    const _pkgI18n = PkgI18nSubSpace.use();
    const { common, pkg: pkgI18n } = _pkgI18n.at;
    const messages = pkgI18n.t;

    return () => {
      return (
        <div>
          {pkg.renderHeader()}

          <VDocsSection title={messages.concept.title}>
            {messages.concept.content()}
          </VDocsSection>

          <VDocsSection title={common.t.usage}>
            <VDocsSection title={messages.define.title}>
              <VCode
                language="ts"
                code={`
                  // logger.ts

                  import {
                    loggerBuilder,
                    Transport,
                    ConsoleTransport,
                    DDTransport,
                    STDOTransport,
                  } from '@fastkit/universal-logger';
                  import { datadogLogs } from '@datadog/browser-logs';
                  import { runtimeConfig } from './runtime-config';

                  const transports: Transport[] = [];

                  const secretValueMatchRe = /(password|x-api-key)/i;

                  export function passwordFilter(key: string, value: any) {
                    if (typeof value !== 'string') return value;
                    if (!secretValueMatchRe.test(key)) return value;
                    const rawString = value.slice(0, 3);
                    const maskedString = value.slice(3, value.length);
                    return \`\${rawString}\${'#'.repeat(maskedString.length)}\`;
                  }


                  if (!import.meta.env.SSR) {
                    transports.push(
                      ConsoleTransport({
                        level: import.meta.env.DEV ? 'debug' : 'info',
                        pretty: true,
                      }),
                      DDTransport({
                        dd: datadogLogs,
                        level: 'info',
                        config: {
                          service: runtimeConfig.appName,
                          env: runtimeConfig.stage,
                          clientToken: runtimeConfig.datadogClientToken,
                        },
                        clone: {
                          sanitizers: [passwordFilter],
                        },
                      }),
                    );
                  } else {
                    transports.push(
                      STDOTransport({
                        pretty: import.meta.env.APP_STAGE === 'dev',
                      }),
                    );
                  }

                  export const { getLogger, getNamedSettings, Logger } = loggerBuilder({
                    defaultSettings: {
                      level: import.meta.env.DEV ? 'debug' : 'trace',
                      transports,
                    },
                  });
                `}
              />
            </VDocsSection>

            <VDocsSection title={messages.use.title}>
              <VCode
                language="ts"
                code={`
                  // some-file.ts
                  import { getLogger } from './logger';

                  const logger = getLogger('some-file');

                  logger.info('Hello world!!!', { hoge: 1, fuga: '2', piyo: { puyo: true } });
                `}
              />
            </VDocsSection>
          </VDocsSection>

          <VDocsPaging
            next={{
              to: `/universal-logger/builder/`,
              title: 'Builder API',
            }}
          />
        </div>
      );
    };
  },
});
