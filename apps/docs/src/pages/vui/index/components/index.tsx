import { defineComponent } from 'vue';
import {
  VHero,
  VButton,
  VGridContainer,
  VGridItem,
  VCard,
  VFileInput,
} from '@fastkit/vui';

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

        <VFileInput label="File" multiple clearable required size="sm" />
        <VFileInput label="File" multiple variant="filled" clearable required />
        <VFileInput label="File" multiple variant="flat" clearable required />
        <VFileInput
          label="File"
          multiple
          variant="outlined"
          clearable
          required
        />

        <VButton
          onClick={() => {
            this.$vui.alert('ok');
          }}>
          alert
        </VButton>

        <VButton
          onClick={() => {
            this.$vui.snackbar({
              content: 'snackbar',
            });
          }}>
          snackbar
        </VButton>

        <VButton
          onClick={() => {
            this.$vui.sheet({
              content: 'ok',
              backdrop: true,
            });
          }}>
          sheet
        </VButton>

        <VGridContainer class="mt-4" spacing={1} spacingY={5}>
          <VGridItem size={4}>
            <VCard>4</VCard>
          </VGridItem>
          <VGridItem size={4}>
            <VCard>4</VCard>
          </VGridItem>
          <VGridItem size={4}>
            <VCard>4</VCard>
          </VGridItem>
        </VGridContainer>

        <VGridContainer class="mt-4" spacing={1} spacingY={5}>
          <VGridItem size={{ xs: 12, md: 4 }}>
            <VCard>xs12 / md4</VCard>
          </VGridItem>
          <VGridItem size={{ xs: 12, md: 4 }}>
            <VCard>xs12 / md4</VCard>
          </VGridItem>
          <VGridItem size={{ xs: 12, md: 4 }}>
            <VCard>xs12 / md4</VCard>
          </VGridItem>
        </VGridContainer>

        <VGridContainer class="mt-4" justifyContent={'center'}>
          <VGridItem size={{ xs: 8, md: 6 }}>
            <VCard>xs8 / md6</VCard>
          </VGridItem>
        </VGridContainer>
      </div>
    );
  },
});
