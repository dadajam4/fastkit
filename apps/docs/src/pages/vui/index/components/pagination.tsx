import { defineComponent, ref } from 'vue';
import { VHero, VPagination, useVueStack } from '@fastkit/vui';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const page1 = ref(1);
    const stack = useVueStack();

    return {
      page1,
      stack,
    };
  },
  render() {
    return (
      <div class="pg-docs-components-icons">
        <VHero>Pagination</VHero>
        <DocsSection title="Basic">
          <VPagination length="32" v-model={this.page1} />
          <div>{`現在 ${this.page1} ページ目です`}</div>
        </DocsSection>

        <DocsSection title="Dense">
          <VPagination dense length="32" />
        </DocsSection>

        <DocsSection title="Routings">
          <VPagination dense length="32" routeQuery="page" />
        </DocsSection>

        <DocsSection title="Guard">
          <VPagination
            dense
            length="32"
            beforeChange={async (page) => {
              const result = await this.stack.confirm(
                `${page}ページへ変更して良いですか？`,
              );
              if (!result) {
                this.stack.alert('キャンセルしました');
                return false;
              }
            }}
          />
        </DocsSection>
      </div>
    );
  },
});
