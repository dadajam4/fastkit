import { h, defineComponent } from 'vue';
import _package from 'virtual:package:__PACKAGE_NAME__';
// import { VPackageProvider as _Provider } from './VPackageProvider';
import { VPackageProvider as _Provider } from '@@/package-loader/components/VPackageProvider/VPackageProvider';

export const pkg = _package;

export const VPackageProvider = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'VPackageProvider:__PACKAGE_NAME__',
  setup(props, ctx) {
    return () => h(_Provider, { value: pkg }, ctx.slots?.default);
  },
});

export default VPackageProvider;
