import { App } from 'vue';
// import { VueColorSchemePlugin } from '@fastkit/vue-color-scheme';

export class VueStackPlugin {
  static readonly installedApps = new Set<App>();

  static install(app: App) {
    const { installedApps } = this;
    if (installedApps.has(app)) return;
    const unmountApp = app.unmount;
    installedApps.add(app);
    app.config.globalProperties.$vstack = this;

    app.unmount = function () {
      installedApps.delete(app);
      unmountApp();
    };
  }
}
// export type VueStackPlugin<
//   TN extends string,
//   PN extends string,
//   SN extends string,
// > = ReturnType<Wrapper<TN, PN, SN>['build']>;

// export function buildVueStack<
//   TN extends string,
//   PN extends string,
//   SN extends string,
// >(colorScheme: VueColorSchemePlugin<TN, PN, SN>) {
//   const installedApps = new Set<App>();
//   const { VColorSchemeProvider } = colorScheme.components;
//   const VStack = buildVStack(VColorSchemeProvider);

//   return {
//     colorScheme,
//     components: {
//       VStack,
//     },
//     install(app: App) {
//       if (installedApps.has(app)) return;
//       const unmountApp = app.unmount;
//       installedApps.add(app);
//       app.config.globalProperties.$vstack = this;

//       app.unmount = function () {
//         installedApps.delete(app);
//         unmountApp();
//       };
//     },
//   };
// }
