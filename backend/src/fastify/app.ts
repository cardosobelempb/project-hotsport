import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify, { FastifyInstance } from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { AppError } from '../errors/index.js';
import { adminRoutes } from '../routes/admin-routes.js';
import { authRoutes } from '../routes/auth-routes.js';
import { dashboardRoutes } from '../routes/dashboard-routes.js';
import { lgpdRoutes } from '../routes/lgpd-routes.js';
import { mercadoPagoRoutes } from '../routes/mercadopago-routes.js';
import { mikrotikRoutes } from '../routes/mikrotik-routes.js';
import { paymentRoutes } from '../routes/payment-routes.js';
import { planRoutes } from '../routes/plan-routes.js';
import { pocRoutes } from '../routes/poc-routes.js';
import { radiusRoutes } from '../routes/radius-routes.js';
import { statusRoutes } from '../routes/status-routes.js';

export const buildApp = (): FastifyInstance => {
  const app = fastify({ logger: true });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.message, code: error.code });
    }

    if (error instanceof Error && 'validation' in error) {
      return reply.status(400).send({ error: 'Validation error', code: 'VALIDATION_ERROR' });
    }

    return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Hotsport API',
        description: 'API do sistema Hotsport de gerenciamento de hotspot',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${process.env['PORT'] ?? 4949}` }],
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(adminRoutes, { prefix: '/api/admin' });
  app.register(planRoutes, { prefix: '/api/planos' });
  app.register(mikrotikRoutes, { prefix: '/api/mikrotiks' });
  app.register(paymentRoutes, { prefix: '/api/pagamentos' });
  app.register(radiusRoutes, { prefix: '/api/radius' });
  app.register(lgpdRoutes, { prefix: '/api/lgpd' });
  app.register(mercadoPagoRoutes, { prefix: '/api/config-mercadopago' });
  app.register(dashboardRoutes, { prefix: '/api/dashboard' });
  app.register(statusRoutes, { prefix: '/status' });
  app.register(pocRoutes, { prefix: '/api/poc' });

  return app;
};
