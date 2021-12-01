import { defineComponent, h } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';
import { VPageProgress } from '../VPageProgress';
import { useVuePageControl } from '../../injections';
import { ClientOnly } from '../ClientOnly';
import { useRouter } from 'vue-router';

export const VPageRoot = defineComponent({
  name: 'VPageRoot',
  setup(props, ctx) {
    const control = useVuePageControl();

    useRouter();

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
