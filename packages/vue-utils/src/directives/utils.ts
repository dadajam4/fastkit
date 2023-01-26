import type { App, Directive } from 'vue';

export function installDirective(
  app: App,
  name: string,
  directive: Directive<any, any>,
) {
  if (app._context.directives[name] !== directive) {
    app.directive(name, directive);
  }
  return app;
}
