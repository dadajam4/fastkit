import './VMenu.scss';

import { defineMenuComponent } from '@fastkit/vue-stack';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';

const colorProps = colorSchemeProps();

export const VMenu = defineMenuComponent({
  name: 'VMenu',
  attrs: {
    class: 'v-menu',
  },
  props: {
    ...colorProps,
  },
  setup(ctx) {
    const color = useColorClasses(ctx.props, { useRootThemeDefault: true });

    ctx.setupContext.expose({
      menu: ctx,
    });

    return (children) => {
      return (
        <div class={['v-menu__body', color.colorClasses.value]} {...ctx.attrs}>
          {children}
        </div>
      );
    };
  },
});
