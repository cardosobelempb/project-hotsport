import fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { authRoutes } from './routes/auth-routes.js';
import { dashboardRoutes } from './routes/dashboard-routes.js';
import { lgpdRoutes } from './routes/lgpd-routes.js';
import { mercadoPagoRoutes } from './routes/mercadopago-routes.js';
import { mikrotikRoutes } from './routes/mikrotik-routes.js';
import { paymentRoutes } from './routes/payment-routes.js';
import { planRoutes } from './routes/plan-routes.js';
import { radiusRoutes } from './routes/radius-routes.js';
import { statusRoutes } from './routes/status-routes.js';

const app = fastify({ logger: true });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(authRoutes, { prefix: '/api/auth' });
app.register(planRoutes, { prefix: '/api/planos' });
app.register(mikrotikRoutes, { prefix: '/api/mikrotiks' });
app.register(paymentRoutes, { prefix: '/api/pagamentos' });
app.register(radiusRoutes, { prefix: '/api/radius' });
app.register(lgpdRoutes, { prefix: '/api/lgpd' });
app.register(mercadoPagoRoutes, { prefix: '/api/config-mercadopago' });
app.register(dashboardRoutes, { prefix: '/api/dashboard' });
app.register(statusRoutes, { prefix: '/status' });

const PORT = process.env['PORT'] ? Number(process.env['PORT']) : 4949;

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`🚀 API rodando na porta ${PORT}`);
});
