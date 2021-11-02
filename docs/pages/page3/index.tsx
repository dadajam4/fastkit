// import './Home.scss';
// import { ref } from 'vue';
import { RouterLink } from 'vue-router';

export default defineNuxtComponent({
  setup() {
    if (RouterLink) {
      throw new Error('hoge');
    }
    return {};
  },
  render() {
    return (
      <div>
        <h1>Index</h1>
      </div>
    );
  },
});
