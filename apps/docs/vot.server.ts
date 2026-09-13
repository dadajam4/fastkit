import { defineVotServer } from '@fastkit/vot/server';

export default defineVotServer({
  host: '0.0.0.0',
  port: 3000,
  proxy: {
    '/google': 'https://google.com',
  },
  configureServer({ use }) {
    use('/healthcheck', (req, res) => {
      res.writeHead(200).end();
    });
  },
});
