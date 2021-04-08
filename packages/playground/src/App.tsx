import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';

export const App = defineComponent({
  name: 'App',
  render() {
    return (
      <div>
        <h1>App</h1>
        <RouterView></RouterView>
      </div>
    );
  },
});
