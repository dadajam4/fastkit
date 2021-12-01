import { defineComponent } from 'vue';
import { useVuePageControl } from '../../injections';
import { VuePageControlError } from '../../composables/page-error';

export const VErrorPage = defineComponent({
  name: 'VErrorPage',
  setup() {
    const control = useVuePageControl();

    return () => {
      const pageError = control.pageError || new VuePageControlError();

      return (
        <div
          class="v-error-page"
          style={{
            padding: '32px',
            fontSize: '16px',
            lineHeight: '1.5',
          }}>
          <h1
            class="v-error-page__status-code"
            style={{
              fontSize: '3em',
              margin: '16px 0',
            }}>
            {pageError.statusCode}
          </h1>
          <p
            class="v-error-page__message"
            style={{
              margin: '1em 0',
            }}>
            {pageError.message}
          </p>
          <pre
            class="v-error-page__stack"
            style={{
              whiteSpace: 'pre-wrap',
            }}>
            <code
              style={{
                fontFamily: 'monospace, monospace',
                fontSize: '0.75em',
              }}>
              {pageError.stack}
            </code>
          </pre>
        </div>
      );
    };
  },
});
