import { defineComponent } from 'vue';
import { VHero, VLink } from '@fastkit/vui';

export default defineComponent({
  render() {
    return (
      <div>
        <VHero>Test / Index</VHero>
        <VLink to="/vui/test/child1">child1</VLink>
      </div>
    );
  },
});
