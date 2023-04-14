import { createVotPlugin } from '@fastkit/vot';
import { PMScript } from './pm-script';
import { PM_SCRIPT_INJECTION_KEY } from './injections';

export const pmScriptPlugin = createVotPlugin({
  setup(ctx) {
    const pmScript = new PMScript(ctx);
    ctx.provide(PM_SCRIPT_INJECTION_KEY, pmScript);
  },
});
