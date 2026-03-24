import 'dotenv/config';
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { authRoutes } from './routes/auth-routes.js';
import { meRoutes } from './routes/me-routes.js';
import { planRoutes } from './routes/plan-routes.js';
import { mikrotikRoutes } from './routes/mikrotik-routes.js';
import { pagamentoRoutes } from './routes/pagamento-routes.js';
import { radiusRoutes } from './routes/radius-routes.js';
import { dashboardRoutes } from './routes/dashboard-routes.js';
import { lgpdRoutes } from './routes/lgpd-routes.js';
import { efiRoutes } from './routes/efi-routes.js';
import { mercadoPagoRoutes } from './routes/mercadopago-routes.js';

const app = Fastify({ logger: true });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

async function start() {
  await app.register(fastifyCors, { origin: '*' });

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Hotspot API',
        version: '1.0.0',
        description: 'API do sistema de hotspot',
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(meRoutes, { prefix: '/api' });
  await app.register(planRoutes, { prefix: '/api/planos' });
  await app.register(mikrotikRoutes, { prefix: '/api/mikrotiks' });
  await app.register(pagamentoRoutes, { prefix: '/api/pagamentos' });
  await app.register(radiusRoutes, { prefix: '/api/radius' });
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
  await app.register(lgpdRoutes, { prefix: '/api/lgpd' });
  await app.register(efiRoutes, { prefix: '/api/efi' });
  await app.register(mercadoPagoRoutes, { prefix: '/api/config-mercadopago' });

  const PORT = Number(process.env['PORT'] ?? 4949);

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Servidor Fastify rodando na porta ${PORT}`);
    console.log(`📚 Docs em http://localhost:${PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
