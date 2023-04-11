import './VDocsPaging.scss';

import { defineComponent, VNodeChild, PropType } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { VCard, VIcon } from '@fastkit/vui';
import { i18n } from '@@/i18n';

export interface DocsPagingItem {
  to: RouteLocationRaw;
  title: VNodeChild | (() => VNodeChild);
}

const VECTORS = ['prev', 'next'] as const;

export const VDocsPaging = defineComponent({
  name: 'VDocsPaging',
  props: {
    prev: Object as PropType<DocsPagingItem>,
    next: Object as PropType<DocsPagingItem>,
  },
  setup(props) {
    const { trans } = i18n.use().at.common;
    const createItem = (key: (typeof VECTORS)[number]) => {
      const item = props[key];
      if (!item) return;

      const { to, title } = item;

      const isPrev = key === 'prev';
      const type = isPrev ? trans.previousPage : trans.nextPage;

      const _title = typeof title === 'function' ? title() : title;

      return (
        <VCard
          key={key}
          to={to}
          class={['v-docs-paging__item', `v-docs-paging__item--${key}`]}>
          <div class="v-docs-paging__item__type">
            {isPrev && <VIcon key="prev" name="mdi-chevron-left" />}
            {type}
            {!isPrev && <VIcon key="next" name="mdi-chevron-right" />}
          </div>
          <div class="v-docs-paging__item__title">{_title}</div>
        </VCard>
      );
    };

    const createItems = () => VECTORS.map((key) => createItem(key));

    return () => {
      return <nav class="v-docs-paging docs-container">{createItems()}</nav>;
    };
  },
});
