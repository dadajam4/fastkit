import { defineComponent } from 'vue';
import { VPackageProvider } from 'virtual:package-provider:catcher';
import { PackageProvide } from '@@/package-loader';
import { VDocsSection, VCode, VTSDocsAnyMeta } from '~/components';
import { ApiMeta } from '../-shared';
import { PkgI18nSubSpace } from '../index';

export default defineComponent({
  setup() {
    const pkg = PackageProvide.use();
    pkg.useHead();
    const _pkgI18n = PkgI18nSubSpace.use();
    const messages = _pkgI18n.at.pkg.t;
    const meta = new ApiMeta();

    return () => (
      <VPackageProvider
        v-slots={{
          // eslint-disable-next-line no-shadow
          default: ({ pkg }) => (
            <>
              {pkg.renderHeader()}

              <VDocsSection title={messages.why.title}>
                {messages.why.content()}

                <VDocsSection title={messages.assumedPhilosophy.title}>
                  {messages.assumedPhilosophy.content()}
                </VDocsSection>
              </VDocsSection>

              <VDocsSection title={messages.flowOfUsage.title}>
                <VDocsSection title={`1. ${messages.step1.title}`}>
                  <small>{messages.flowOfUsage.example}</small>
                  {messages.step1.content()}
                </VDocsSection>

                <VDocsSection title={`2. ${messages.step2.title}`}>
                  <small>{messages.flowOfUsage.example}</small>
                  <VCode
                    language="ts"
                    code={`
                        import { build, axiosErrorResolver } from '@fastkit/catcher';

                        type YourAppErrorInput = string | number | { [key: string]: any };

                        interface YourAppErrorNormalized {
                          name: string;
                          message: string;
                          stack?: string;
                          status: number;
                        }

                        export class YourAppError extends build({
                          resolvers: [axiosErrorResolver],
                          normalizer: (resolvedData) => {
                            return (input: YourAppErrorInput): YourAppErrorNormalized => {
                              let { name, message, status } = resolveYourAppErrorInput(input);
                              let stack: string | undefined;
                              const { axiosError, nativeError } = resolvedData;
                              if (axiosError) {
                                name = axiosError.name;
                                message = axiosError.message;
                                stack = axiosError.stack;
                                const { response } = axiosError;
                                if (response) {
                                  status = response.status;
                                }
                              } else if (nativeError) {
                                name = nativeError.name;
                                message = nativeError.message;
                                stack = nativeError.stack;
                                if (nativeError.name === 'PayloadTooLargeError') {
                                  status = 413;
                                }
                              }
                              const statusResolved = resolveStatusMessage(status);
                              status = statusResolved.status;
                              if (!message) {
                                message = statusResolved.message;
                              }
                              return {
                                name,
                                message,
                                stack,
                                status,
                              };
                            },
                          },
                        });
                      `}
                  />
                </VDocsSection>

                <VDocsSection title={`3. ${messages.step3.title}`}>
                  <small>{messages.flowOfUsage.example}</small>
                  <VCode
                    language="ts"
                    code={`
                        import { YourAppError } from './error';

                        export async function someFn() {
                          try {
                            const result = await axios.get('/some/path/');
                            return result.data;
                          } catch (_err) {
                            const err = YourAppError.from(_err);
                            if (err.status === 404) {
                              alert('Not found...!!!');
                              return;
                            }
                            throw err;
                          }
                        }
                      `}
                  />
                </VDocsSection>
              </VDocsSection>

              <VTSDocsAnyMeta value={meta.types.buildMeta} />
              <VTSDocsAnyMeta value={meta.types.CatcherBuilderOptionsMeta} />
              <VTSDocsAnyMeta value={meta.types.CatcherConstructorMeta} />
              <VTSDocsAnyMeta value={meta.types.CatcherMeta} />
            </>
          ),
        }}
      />
    );
  },
});
