import { defineComponent } from 'vue';
import { VDocsSection, VCode, VTSDocsAnyMeta } from '~/components';
import { VPackageProvider } from 'virtual:package-provider:catcher';
import { i18n } from '@@/i18n';
import { pkg } from './-i18n';
import { ApiMeta } from './-shared';

const PkgI18nSubSpace = i18n.defineSubSpace({ pkg });

export default defineComponent({
  i18n: PkgI18nSubSpace,
  prefetch: ApiMeta.prefetch,
  setup() {
    const pkgI18n = PkgI18nSubSpace.use();
    const { common } = pkgI18n.at;
    const meta = new ApiMeta();

    return () => {
      return (
        <VPackageProvider
          v-slots={{
            default: ({ pkg }) => (
              <>
                {pkg.renderHeader()}
                <VDocsSection
                  title={common.t.usage}
                  style={{ marginBottom: '120px' }}>
                  <VCode
                    language="ts"
                    code={`
                    import { build, axiosErrorResolver } from '@fastkit/catcher';

                    type CustomErrorInput = string | number | { [key: string]: any };

                    interface CustomErrorNormalized {
                      name: string;
                      message: string;
                      stack?: string;
                      status: number;
                    }

                    export class CustomError extends build({
                      resolvers: [axiosErrorResolver],
                      normalizer: (resolvedData) => {
                        return (input: CustomErrorInput): CustomErrorNormalized => {
                          let { name, message, status } = resolveCustomErrorInput(input);
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

                    async function someFn() {
                      try {
                        await someLogic();
                      } catch (_err) {
                        const customError = CustomError.from(_err);

                        if (customError.status === 404) {
                          alert('Not found...!!!');
                        } else {
                          throw customError;
                        }
                      }
                    }
                  `}
                  />
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
    };
  },
});
