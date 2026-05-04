// shared/module/register-module.ts

import type { FastifyInstance } from "fastify";
import { DIContainer } from "../container/di-container";
import { registerControllers } from "../http/register-routes";
import type { ControllerInstance, ModuleDefinition } from "./module.types";

export async function registerModule(
  app: FastifyInstance,
  module: ModuleDefinition,
): Promise<void> {
  const container = new DIContainer();

  container.register(module.providers);

  const controllers: ControllerInstance[] = module.controllers.map(
    (Controller) => container.resolve(Controller),
  );

  await registerControllers(app, controllers);
}
