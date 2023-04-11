import './VDocsSection.scss';

import { defineComponent, PropType } from 'vue';
import { useDocsSection, VDocsSectionLevel } from './context';
import { VIcon } from '@fastkit/vui';

export const VDocsSection = defineComponent({
  name: 'VDocsSection',
  props: {
    level: Number as PropType<VDocsSectionLevel>,
    title: {
      type: String,
      required: true,
    },
    id: String,
  },
  setup(props, ctx) {
    const { id, level } = useDocsSection({
      level: () => props.level,
      title: () => props.title,
      id: () => props.id,
    });
    const Heading = `h${level()}` as const;

    return () => {
      return (
        <section
          id={id()}
          class={[
            'v-docs-section',
            `v-docs-section--${level()}`,
            'docs-container',
          ]}>
          <Heading
            class={[
              'v-docs-section__heading',
              `v-docs-section__heading--${level()}`,
            ]}>
            <a class="v-docs-section__heading__anchor" href={`#${id()}`}>
              <VIcon
                class="v-docs-section__heading__anchor__icon"
                name={'mdi-link'}
              />
            </a>
            {props.title}
          </Heading>
          {ctx.slots.default && ctx.slots.default()}
        </section>
      );
    };
  },
});
