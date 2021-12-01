import { defineComponent } from 'vue';
import { VButton, VSelect, VAppContainer } from '@fastkit/vui';
import { RouterLink } from 'vue-router';
import { range } from '@fastkit/helpers';
import { AuthSearvice } from '../plugins';
import { useState } from '@fastkit/vot';

export default defineComponent({
  setup() {
    const auth = AuthSearvice.use();
    const hoge = useState(AuthSearvice.StateInjectionKey);
    console.log('■', hoge);

    return {
      auth: auth.state,
      isLoggedIn: () => auth.isLoggedIn,
    };
  },
  render() {
    return (
      <div>
        <VAppContainer>
          <p>
            1{JSON.stringify(this.auth.me)} {JSON.stringify(this.isLoggedIn())}
          </p>
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

        <VButton color="accent">あいうえお</VButton>
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
