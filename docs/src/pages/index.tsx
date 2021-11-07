import { defineComponent } from 'vue';
import { VButton, VSelect } from '@fastkit/vui';
import { RouterLink } from 'vue-router';
import { range } from '@fastkit/helpers';

export default defineComponent({
  render() {
    return (
      <div>
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
