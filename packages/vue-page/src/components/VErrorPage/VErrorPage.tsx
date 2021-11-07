import { defineComponent } from 'vue';
import { useVuePageControl } from '../../composables/page-control';
import { VuePageControlError } from '../../composables/page-error';

export const VErrorPage = defineComponent({
  name: 'VErrorPage',
  setup() {
    const control = useVuePageControl();

    return () => {
      const pageError = control.pageError || new VuePageControlError();

      return (
        <div class="v-error-page">
          <h1>Error! ({pageError.statusCode})</h1>
          <p>{pageError.message}</p>
          <pre>
            <code>{pageError.stack}</code>
          </pre>
        </div>
      );
    };
  },
});
