import './VLanguageSwitcher.scss';

import { defineComponent } from 'vue';
import { i18n } from '@@';
import { VButton } from '@fastkit/vui';

export const VLanguageSwitcher = defineComponent({
  name: 'VLanguageSwitcher',
  props: {
    inline: Boolean,
  },
  setup(props) {
    const space = i18n.use();

    return () => {
      const { inline } = props;

      return (
        <nav
          class={[
            'v-language-switcher',
            `v-language-switcher--${inline ? 'inline' : 'stack'}`,
          ]}>
          {space.locales.map((locale) => {
            const isCurrent = space.currentLocaleIs(locale.name);

            return (
              <VButton
                class="v-language-switcher__link"
                variant="plain"
                align={inline ? 'center' : 'left'}
                key={locale.name}
                startIcon={isCurrent ? 'mdi-chevron-right' : undefined}
                onClick={() => space.setLocale(locale.name)}
                loading={locale.name === space.nextLocaleName}
                disabled={isCurrent}>
                {locale.meta.displayName}
              </VButton>
            );
          })}
        </nav>
      );
    };
  },
});
