import { defineComponent } from 'vue';
import {
  VPage,
  VSheetModal,
  VToolbar,
  VToolbarEdge,
  VButton,
} from '@fastkit/vui';
import { VDocsLayout } from '~/components';
import { range } from '@fastkit/helpers';

export default defineComponent({
  render() {
    return (
      <VDocsLayout home="/getting-started" title="HOME">
        <VPage />
        <button
          type="button"
          onClick={(ev) =>
            this.$vui.stack.sheet({
              header: () => {
                return <div>あああ</div>;
              },
              content: 'xxxx',
            })
          }>
          click!!
        </button>
        <VSheetModal
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
        </VSheetModal>
      </VDocsLayout>
    );
  },
});
