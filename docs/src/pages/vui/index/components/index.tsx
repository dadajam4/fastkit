import { defineComponent } from 'vue';
import { VHero, VButton, VGridContainer, VGridItem, VCard } from '@fastkit/vui';

export default defineComponent({
  render() {
    return (
      <div>
        <VHero
          v-slots={{
            adornment: () => <VButton>hoge</VButton>,
          }}>
          Components
        </VHero>

        <VGridContainer class="mt-4" spacing={1} spacingY={5}>
          <VGridItem xs={12} md={4}>
            <VCard>xs12 / md4</VCard>
          </VGridItem>
          <VGridItem xs={12} md={4}>
            <VCard>xs12 / md4</VCard>
          </VGridItem>
          <VGridItem xs={12} md={4}>
            <VCard>xs12 / md4</VCard>
          </VGridItem>
        </VGridContainer>

        <VGridContainer class="mt-4">
          <VGridItem xs={8} md={6}>
            <VCard>xs12 / md4</VCard>
          </VGridItem>
        </VGridContainer>
      </div>
    );
  },
});
