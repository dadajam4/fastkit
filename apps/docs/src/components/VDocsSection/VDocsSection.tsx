import './VDocsSection.scss';

import { defineComponent, PropType, VNodeChild } from 'vue';
import { VIcon } from '@fastkit/vui';
import { useDocsSection, VDocsSectionLevel } from './context';

export const VDocsSection = defineComponent({
  name: 'VDocsSection',
  props: {
    level: Number as PropType<VDocsSectionLevel>,
    title: {
      type: String,
      required: true,
    },
    prefix: [Function] as PropType<() => VNodeChild>,
    suffix: [Function] as PropType<() => VNodeChild>,
    id: String,
    notranslateTitle: Boolean,
  },
  setup(props, ctx) {
    const { id, level } = useDocsSection({
      level: () => props.level,
      title: () => props.title,
      id: () => props.id,
    });
    const Heading = `h${level()}` as const;

    return () => (
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
            {
              notranslate: props.notranslateTitle,
            },
          ]}>
          <a class="v-docs-section__heading__anchor" href={`#${id()}`}>
            <VIcon
              class="v-docs-section__heading__anchor__icon"
              name={'mdi-link'}
            />
          </a>
          <span class="v-docs-section__heading__text">
            {props.prefix && (
              <span key="prefix" class="v-docs-section__heading__text__prefix">
                {props.prefix()}
              </span>
            )}
            {props.title}
            {props.suffix && (
              <span key="suffix" class="v-docs-section__heading__text__suffix">
                {props.suffix()}
              </span>
            )}
          </span>
        </Heading>
        {ctx.slots.default && ctx.slots.default()}
      </section>
    );
  },
});
