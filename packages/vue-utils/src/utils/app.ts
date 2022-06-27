import { App } from 'vue';

export function onAppUnmount<HostElement = any>(
  app: App<HostElement>,
  unmount: () => any,
) {
  const unmountApp = app.unmount;

  app.unmount = function wrapedUnmount() {
    try {
      unmount();
    } finally {
      unmountApp();
    }
  };
}
