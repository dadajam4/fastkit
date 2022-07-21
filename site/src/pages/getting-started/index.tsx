import { defineComponent } from 'vue';
import { VPage, VSheetStack } from '@fastkit/vui';
import { VDocsLayout } from '~/components';
import { range } from '@fastkit/helpers';

export default defineComponent({
  render() {
    return (
      <VDocsLayout home="/getting-started" title="HOME">
        <VPage />
        <button type="button" onClick={(ev) => this.$vui.stack.sheet('xxxx')}>
          click!!
        </button>
        <VSheetStack
          backdrop
          v-slots={{
            activator: ({ attrs }) => (
              <button {...attrs} type="button">
                xxxx
              </button>
            ),
          }}>
          <div>
            <VSheetStack
              backdrop
              v-slots={{
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
            </VSheetStack>

            {range(100, 1).map((i) => (
              <div key={i} class="p-4">{`テキスト${i}が入ります。`}</div>
            ))}
          </div>
        </VSheetStack>
      </VDocsLayout>
    );
  },
});
