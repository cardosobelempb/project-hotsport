import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

import { adminRoutes } from './routes/admin-routes.js';
import { authRoutes } from './routes/auth-routes.js';
import { configMercadoPagoRoutes } from './routes/config-mercadopago-routes.js';
import { dashboardRoutes } from './routes/dashboard-routes.js';
import { lgpdRoutes } from './routes/lgpd-routes.js';
import { limpezaRoutes } from './routes/limpeza-routes.js';
import { mikrotikRoutes } from './routes/mikrotik-routes.js';
import { pagamentosRoutes } from './routes/pagamentos-routes.js';
import { planosPublicosRoutes } from './routes/planos-publicos-routes.js';
import { planosRoutes } from './routes/planos-routes.js';
import { radiusRoutes } from './routes/radius-routes.js';
import { whatsappRoutes } from './routes/whatsapp-routes.js';

const app = Fastify({ logger: true });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(cors, { origin: true });

await app.register(swagger, {
  openapi: {
    info: {
      title: 'HotSport API',
      description: 'API de gerenciamento de hotspot WiFi — planos, pagamentos, MikroTik e RADIUS',
      version: '1.0.0',
    },
    tags: [
      { name: 'Auth', description: 'Autenticação de administradores' },
      { name: 'Planos', description: 'Gerenciamento de planos de internet' },
      { name: 'Planos Públicos', description: 'Planos visíveis para clientes sem autenticação' },
      { name: 'MikroTik', description: 'Gerenciamento de dispositivos MikroTik' },
      { name: 'Pagamentos', description: 'Registro e consulta de pagamentos' },
      { name: 'Radius', description: 'Gerenciamento de usuários RADIUS' },
      { name: 'Dashboard', description: 'Métricas e resumo do painel administrativo' },
      { name: 'LGPD', description: 'Registros de consentimento conforme LGPD' },
      { name: 'WhatsApp', description: 'Integração com WhatsApp para notificações' },
      { name: 'Configurações', description: 'Configurações de gateways de pagamento (Mercado Pago)' },
      { name: 'Limpeza', description: '⚠️ Operações destrutivas de limpeza de dados' },
      { name: 'Admin', description: 'Gerenciamento de perfil do administrador' },
    ],
  },
});

await app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: { docExpansion: 'list', deepLinking: true },
});

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(planosRoutes, { prefix: '/api/planos' });
await app.register(planosPublicosRoutes, { prefix: '/api/planos-publicos' });
await app.register(mikrotikRoutes, { prefix: '/api/mikrotiks' });
await app.register(pagamentosRoutes, { prefix: '/api/pagamentos' });
await app.register(radiusRoutes, { prefix: '/api/radius' });
await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
await app.register(lgpdRoutes, { prefix: '/api/lgpd' });
await app.register(whatsappRoutes, { prefix: '/api/whatsapp' });
await app.register(configMercadoPagoRoutes, { prefix: '/api/config-mercadopago' });
await app.register(limpezaRoutes, { prefix: '/api/limpeza' });
await app.register(adminRoutes, { prefix: '/api/admin' });

const port = Number(process.env['PORT'] ?? 4949);

try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`🚀 Servidor Fastify rodando na porta ${port}`);
  console.log(`📖 Swagger UI disponível em http://localhost:${port}/docs`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
