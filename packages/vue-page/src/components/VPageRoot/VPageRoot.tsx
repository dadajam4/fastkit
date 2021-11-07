import { defineComponent, h } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';
import { VPageProgress } from '@fastkit/vue-page';
import { useVuePageControl } from '../../composables/page-control';
import { ClientOnly } from '../ClientOnly';

export const VPageRoot = defineComponent({
  name: 'VPageRoot',
  setup(props, ctx) {
    const control = useVuePageControl();

    return () => {
      const { pageError } = control;
      const content = pageError
        ? h(control.ErrorComponent as any, { key: 'error' })
        : renderSlotOrEmpty(ctx.slots, 'default');

      return (
        <>
          {content}
          <ClientOnly>
            <VPageProgress />
          </ClientOnly>
        </>
      );
    };
  },
});
