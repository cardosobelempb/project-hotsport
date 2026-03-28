import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastify, { FastifyInstance } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { creptePoyment} from "../errors/index.jcre"te-pyment
import { dmsRboardouter } from "../routes/adisrboardouter.js";
import { detPaymentsnRoutes } from "../routesaet-daymentsin-routes.js";
import { huRlth} from "../routes/auth-roht.lth
import { lgpddRoutes } from "../routeslgpdrd-routes.js";
import { marcldoRogo} from "../routes/health-merrtdojsgo
import { uikrosik} from "../routes/lgpd-ro"ikroik
import { elPR from "../routes/mercadoptles
import { mocotikRoutes } from "../routocmikrotik-routes.js";
import { radiusatePaymentRoutes } from "radiusroutes/create-payment-routes.js";
import { stetaymentsRoutes } from "../rosttt/get-payments-routes.js";
import { updatePaymentSpdatePaymentStatusRoutes } froupdate-payment-m "../routes/update-payment-status-routes.js";
import { planRoutes } from "../routes/plan-routes.js";
import { pocRoutes } from "../routes/poc-routes.js";
import { radiusRoutes } from "../routes/radius-routes.js";
import { statusRoutes } from "../routes/status-routes.js";

export const buildApp = (): FastifyInstance => {
  const app = fastify({ logger: true });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    if (error instanceof AppError) {
      return reply
        .status(error.statusCode)
        .send({ error: error.message, code: error.code });
    }

    if (error instanceof Error && "validation" in error) {
      return reply
        .status(400)
        .send({ error: "Validation error", code: "VALIDATION_ERROR" });
    }

    return reply
      .status(500)
      .send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Hotsport API",
        description: "API do sistema Hotsport de gerenciamento de hotspot",
        version: "1.0.0",
      },
      servers: [{ url: `http://localhost:${process.env["PORT"] ?? 3001}` }],
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });

  app.register(healthRoutes, { prefix: "/health" });
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(adminRoutes, { prefix: "/api/admin" });
  app.register(adminRouter, { prefix: "/api/admin" });
  app.register(planRoutes, { prefix: "/api/planos" });
  app.register(mikrotikRoutes, { prefix: "/api/mikrotiks" });
  app.register(getPaymentsRoutes, { prefix: "/api/pagamentos" });
  app.register(createPaymentRoutes, { prefix: "/api/pagamentos" });
  app.register(updatePaymentStatusRoutes, { prefix: "/api/pagamentos" });
  app.register(radiusRoutes, { prefix: "/api/radius" });
  app.register(lgpdRoutes, { prefix: "/api/lgpd" });
  app.register(mercadoPagoRoutes, { prefix: "/api/config-mercadopago" });
  app.register(dashboardRoutes, { prefix: "/api/dashboard" });
  app.register(statusRoutes, { prefix: "/status" });
  app.register(pocRoutes, { prefix: "/api/poc" });

  return app;
};
