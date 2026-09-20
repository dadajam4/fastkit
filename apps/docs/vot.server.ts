import { defineVotServer } from '@fastkit/vot/server';

export default defineVotServer({
  host: '0.0.0.0',
  port: 3000,
  proxy: {
    '/google': 'https://google.com',
  },
  configureServer({ app }) {
    app.get('/healthcheck', (c) => c.body(null, 200));
  },
});
