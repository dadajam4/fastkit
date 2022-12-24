import { defineComponent, computed } from 'vue';
import {
  VPage,
  // VSheetModal,
  // VToolbar,
  // VToolbarEdge,
  // VButton,
  // useVui,
} from '@fastkit/vui';
import { VDocsLayout, DocsLayoutNavigation } from '~/components';
import { i18n } from '~/i18n';
import { VPackageProvider } from 'virtual:package-provider:fastkit';

export default defineComponent({
  setup() {
    const space = i18n.use();
    const { trans } = space.at.common;
    const navigationsRef = computed<DocsLayoutNavigation[]>(() => {
      return [
        {
          key: 'guide',
          items: [
            {
              key: 'guide',
              to: '/guide/',
              label: trans.guide,
              startIcon: 'mdi-speedometer',
              children: [
                {
                  key: 'what',
                  to: '/guide/what/',
                  label: trans.whatIsFastkit,
                },
                {
                  key: 'try',
                  to: '/guide/',
                  label: trans.tryItOut,
                },
                {
                  key: 'packages',
                  to: '/guide/packages/',
                  label: trans.packages,
                },
              ],
            },
          ],
        },
      ];
    });

    return () => {
      return (
        <VPackageProvider>
          <VDocsLayout
            // home="/getting-started"
            // title="HOME"
            navigations={navigationsRef.value}>
            <VPage />
            {/* <button
            type="button"
            onClick={(ev) =>
              vui.stack.sheet({
                header: () => {
                  return <div>あああ</div>;
                },
                content: 'xxxx',
              })
            }>
            click!!
          </button> */}
            {/* <VSheetModal
            backdrop
            v-slots={{
              header: (stack) => (
                <VToolbar elevation={1}>
                  <VToolbarEdge edge="start">
                    <VButton
                      icon="mdi-close"
                      size="lg"
                      rounded
                      onClick={() => {
                        stack.close();
                      }}
                    />
                  </VToolbarEdge>
                  <VToolbarEdge edge="end">
                    <VButton>CLOSE</VButton>
                    <VButton>CLOSE</VButton>
                  </VToolbarEdge>
                </VToolbar>
              ),
              activator: ({ attrs }) => (
                <button {...attrs} type="button">
                  xxxx
                </button>
              ),
            }}>
            <div>
              <VSheetModal
                backdrop
                v-slots={{
                  header: () => <VToolbar></VToolbar>,
                  activator: ({ attrs }) => (
                    <button {...attrs} type="button">
                      xxxx
                    </button>
                  ),
                }}>
                <div>
                  {range(100, 1).map((i) => (
                    <div key={i} class="p-4">{`テキスト${i}が入ります。`}</div>
                  ))}
                </div>
              </VSheetModal>

              {range(100, 1).map((i) => (
                <div key={i} class="p-4">{`テキスト${i}が入ります。`}</div>
              ))}
            </div>
          </VSheetModal> */}
          </VDocsLayout>
        </VPackageProvider>
      );
    };
  },
});
