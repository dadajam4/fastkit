import { defineComponent } from 'vue';

export default defineComponent({
  prefetch(ctx) {
    ctx.provide('page3-child', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (true) {
        throw new Error('hoge');
      }
      return 5;
    });
  },
  render() {
    return (
      <div>
        <h1>Page3/child</h1>
        <p>ok</p>
      </div>
    );
  },
});
