import 'dotenv/config';

import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { adminRouter } from './admin/infrastructure/routes/admin.router.js';
import { planRouter, planPublicRouter } from './plan/index.js';
import { authRoutes } from './routes/auth-routes.js';
import { efiRoutes } from './routes/efi-routes.js';
import { lgpdRoutes } from './routes/lgpd-routes.js';
import { meRoutes } from './routes/me-routes.js';
import { mercadoPagoRoutes } from './routes/mercadopago-routes.js';
import { mikrotikRoutes } from './routes/mikrotik-routes.js';
import { otpRoutes } from './routes/otp-routes.js';
import { pagamentoRoutes } from './routes/pagamento-routes.js';
import { radiusRoutes } from './routes/radius-routes.js';

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
  await app.register(adminRouter, { prefix: '/api/admin' });
  await app.register(meRoutes, { prefix: '/api' });
  await app.register(planRouter, { prefix: '/api/plans' });
  await app.register(planPublicRouter, { prefix: '/api/plans/public' });
  await app.register(mikrotikRoutes, { prefix: '/api/mikrotiks' });
  await app.register(pagamentoRoutes, { prefix: '/api/pagamentos' });
  await app.register(radiusRoutes, { prefix: '/api/radius' });
  await app.register(otpRoutes, { prefix: '/auth/otp' });
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
