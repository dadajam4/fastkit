import { defineComponent, onBeforeUnmount } from 'vue';
// import { VButton, VSelect } from '@fastkit/vui';
import { range } from '@fastkit/helpers';
import { VPage } from '@fastkit/vue-page';
import { RouterLink } from 'vue-router';

export default defineComponent({
  prefetch(ctx) {
    console.log('prefetch');
    ctx.provide('page3-parent', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return 5;
    });
  },
  // prefetchHandler(ctx) {
  //   console.log(ctx.control);
  //   console.log('■', Math.random() > 0.5);
  //   return Math.random() > 0.5;
  // },
  // prefetch(ctx) {
  //   ctx.provide(
  //     'xxx',
  //     (queue, params) => {
  //       // queue.
  //       return {};
  //     },
  //     2,
  //   );
  // },
  setup() {
    // console.log(Date.now(), typeof window);
    console.log('>>> setup');

    onBeforeUnmount(() => {
      console.log('!!! onBeforeUnmount');
    });
  },
  render() {
    return (
      <div>
        <h1>Page3</h1>
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
        <VPage />
        {/* <RouterView></RouterView> */}
        {range(100, 1).map((i) => (
          <p key={i}>{`This is Text.${i}`}</p>
        ))}
      </div>
    );
  },
});
