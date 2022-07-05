import { defineComponent } from 'vue';
// import { VButton, VSelect } from '@fastkit/vui';
import { range } from '@fastkit/helpers';
import { RouterLink } from 'vue-router';
import { createPrefetch } from '@fastkit/vue-page';

const prefetch = createPrefetch('xxx', async (queue) => {
  // console.log('---');
  await new Promise((resolve) => setTimeout(resolve, 10));
  if (true) {
    throw new Error('hoge');
  }

  // if (true) {
  //   queue.control.redirect({ path: '/page3' });
  //   // console.log('??????');
  // }
  return { hoge: true };
});

export default defineComponent({
  prefetch,
  // middleware: async (ctx) => {
  //   await new Promise((resolve) => setTimeout(resolve, 100));
  //   // console.log('★1', ctx.from?.path);
  //   ctx.redirect({ path: '/page3' });
  //   // if (ctx.to?.path === '/page2') {
  //   //   ctx.redirect({ path: '/page3' });
  //   //   // ctx.redirect({ path: 'https://hoge.com' });
  //   //   // throw new Error('hoge');
  //   //   // console.log('★', ctx.from);
  //   //   // try {
  //   //   //   ctx.redirect({ path: '/page3' });
  //   //   // } catch (_err) {
  //   //   //   console.log(_err);
  //   //   // }
  //   // }
  //   // console.log(ctx.to);
  //   // ctx.redirect({ path: 'https://hoge.com' });
  // },
  setup() {
    const hoge = prefetch.inject();
    return {
      hoge,
    };
  },
  render() {
    return (
      <div>
        <h1>Page2</h1>
        <div>{JSON.stringify(this.hoge)}</div>
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
        {range(100, 1).map((i) => (
          <p key={i}>{`This is Text.${i}`}</p>
        ))}
      </div>
    );
  },
});
