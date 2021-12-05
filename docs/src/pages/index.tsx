import { defineComponent, ref } from 'vue';
import {
  VButton,
  VSelect,
  VAppContainer,
  VProgressCircular,
  VProgressLinear,
  VCheckbox,
  useVueStack,
} from '@fastkit/vui';
import { RouterLink } from 'vue-router';
import { range } from '@fastkit/helpers';
import { AuthSearvice } from '../plugins';
// import { useState } from '@fastkit/vot';
import { AppError } from '../error';
import { getLogger } from '../logger';

export default defineComponent({
  setup(props, ctx) {
    const auth = AuthSearvice.use();
    // const hoge = useState(AuthSearvice.StateInjectionKey);
    const logger = getLogger('top');
    const loading = ref(false);
    const stack = useVueStack();

    return {
      logger,
      auth: auth.state,
      isLoggedIn: () => auth.isLoggedIn,
      loading,
      stack,
    };
  },
  render() {
    return (
      <div>
        <VAppContainer>
          <p>
            1{JSON.stringify(this.auth.me)} {JSON.stringify(this.isLoggedIn())}
          </p>
          <VProgressCircular indeterminate></VProgressCircular>
          <VProgressLinear
            indeterminate
            active
            color="primary"></VProgressLinear>
          <VProgressLinear indeterminate active></VProgressLinear>
          <button
            onClick={(ev) => {
              const error = AppError.from('zzzz');
              this.logger.error(error);
              this.logger.info('あいうえお', { message: 'あいうえお' });
            }}>
            error
          </button>
          <VCheckbox v-model={this.loading}>loading</VCheckbox>
          <VButton
            color="primary"
            href="https://google.com"
            loading={this.loading}>
            https://google.com
          </VButton>
          <VAppContainer pulled>
            <p>2(pulled)</p>
            <VAppContainer>
              <p>3</p>
              <VAppContainer pulled>
                <p>4(pulled)</p>
              </VAppContainer>
            </VAppContainer>
          </VAppContainer>
        </VAppContainer>
        <ul>
          <li>
            <RouterLink to="/">Home</RouterLink>
          </li>
          <li>
            <RouterLink to="/page2">page2</RouterLink>
          </li>
          <li>
            <RouterLink to="/page3">page3</RouterLink>
          </li>
          <li>
            <RouterLink to="/page3/child">page3/child</RouterLink>
          </li>
        </ul>

        <VButton
          color="accent"
          onClick={() => {
            this.stack.snackbar({
              content: 'hello',
              // actions: [
              //   {
              //     key: 'hello',
              //     content: (ctx) => 'あああ',
              //   },
              // ],
            });
          }}>
          Snackbar
        </VButton>

        <VButton
          color="primary"
          onClick={() => {
            this.stack.alert('This is alert.');
          }}>
          Alert
        </VButton>

        <VButton
          color="primary"
          onClick={async () => {
            const result = await this.stack.confirm('This is confirm.');
            if (result) {
              this.stack.snackbar({
                content: () => 'OK!',
                top: true,
              });
            } else {
              this.stack.snackbar({
                content: () => 'cancelled.',
                // top: true,
              });
            }
          }}>
          Alert
        </VButton>

        <VSelect
          items={[
            {
              value: '1',
              label: 'あいう',
            },
          ]}
          placeholder="Placeholder"></VSelect>
        {range(100, 1).map((i) => (
          <p key={i}>This is Text.{i}</p>
        ))}
      </div>
    );
  },
});
