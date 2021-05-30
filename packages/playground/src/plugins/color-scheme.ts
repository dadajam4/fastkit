import { colorScheme } from '../../.dynamic/color-scheme/color-scheme.info';
import { VueColorSchemePlugin } from '@fastkit/vue-color-scheme';
const vueColorScheme = new VueColorSchemePlugin(colorScheme);

export default vueColorScheme;
