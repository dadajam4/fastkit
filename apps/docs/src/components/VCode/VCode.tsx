import './VCode.scss';

import { defineComponent, ref, onBeforeUnmount } from 'vue';
import { VPrism } from '../VPrism';
import { VButton, VTooltip } from '@fastkit/vui';
import { i18n } from '@@/i18n';

export const VCode = defineComponent({
  name: 'VCode',
  props: {
    code: String,
    language: {
      type: String,
      default: 'markup',
    },
  },
  setup(props, { slots }) {
    const space = i18n.use();
    const copyTimerId = ref<number | null>(null);
    const clearTimer = () => {
      if (copyTimerId.value) {
        clearTimeout(copyTimerId.value);
      }
      copyTimerId.value = null;
    };

    const handleCopy = async (code: string, el: HTMLElement) => {
      clearTimer();
      const selection = window.getSelection();
      if (!selection) return;
      const range = new Range();
      range.selectNodeContents(el);
      selection.removeAllRanges();
      selection.addRange(range);
      await navigator.clipboard.writeText(code);
      copyTimerId.value = window.setTimeout(clearTimer, 2000);
    };

    onBeforeUnmount(clearTimer);

    return () => {
      const { language } = props;
      return (
        <div class="v-code">
          <VPrism
            class="v-code__prism"
            language={language}
            code={props.code}
            v-slots={{
              appends: ({ code, el }) => {
                const children = [
                  <VTooltip
                    openOnHover={false}
                    timeout={2000}
                    v-slots={{
                      activator: ({ attrs, control }) => (
                        <VButton
                          // {...attrs}
                          class="v-code__copy"
                          size="lg"
                          rounded
                          icon={
                            copyTimerId.value === null
                              ? 'mdi-content-copy'
                              : 'mdi-check'
                          }
                          {...{
                            ...attrs,
                            onClick: async (ev) => {
                              await control.close();
                              await handleCopy(code, el());
                              attrs.onClick?.(ev);
                            },
                          }}
                        />
                      ),
                      default: () => space.at.common.trans.copied,
                    }}
                  />,
                ];

                if (code.split('\n').length > 1) {
                  children.push(
                    <span class="v-code__language">{language}</span>,
                  );
                }
                return children;
              },
            }}>
            {slots?.default?.()}
          </VPrism>
        </div>
      );
    };
  },
});
