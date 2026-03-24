import { buildApp } from './fastify/app.js';

const app = buildApp();

const PORT = process.env['PORT'] ? Number(process.env['PORT']) : 4949;

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`🚀 API rodando na porta ${PORT}`);
  app.log.info(`📚 Docs disponíveis em http://localhost:${PORT}/docs`);
});
