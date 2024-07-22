// import * as styles from './index.css';
import { defineComponent } from 'vue';
import { VPackageHome } from '~/components';

export default defineComponent({
  setup() {
    return () => (
      <VPackageHome
        actions={[
          {
            color: 'primary',
            to: '/vue-sortable/playground/',
            startIcon: 'mdi-seesaw',
            label: 'Playground',
          },
        ]}
      />
    );
  },
});
