import { defineComponent, h } from 'vue';
import { ClientOnly } from '@fastkit/vue-utils';
import { useRouter } from 'vue-router';
import { VPageProgress } from '../VPageProgress';
import { useVuePageControl } from '../../injections';

export const VPageRoot = defineComponent({
  name: 'VPageRoot',
  setup(props, ctx) {
    const control = useVuePageControl();

    useRouter();

    return () => {
      if (control.serverRedirected) {
        return [];
      }

      const { pageError } = control;
      const content = pageError
        ? h(control.ErrorComponent as any, { key: 'error' })
        : ctx.slots.default?.();

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
