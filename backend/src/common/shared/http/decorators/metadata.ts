// src/shared/http/decorators/metadata.ts

import type { RouteDefinition } from "./types";

const controllerPrefixMetadata = new WeakMap<Function, string>();
const routesMetadata = new WeakMap<Function, RouteDefinition[]>();

export function setControllerPrefix(target: Function, prefix: string): void {
  controllerPrefixMetadata.set(target, prefix);
}

export function getControllerPrefix(target: Function): string {
  return controllerPrefixMetadata.get(target) ?? "";
}

export function addRoute(target: Function, route: RouteDefinition): void {
  const routes = routesMetadata.get(target) ?? [];

  routes.push(route);

  routesMetadata.set(target, routes);
}

export function getRoutes(target: Function): RouteDefinition[] {
  return routesMetadata.get(target) ?? [];
}

export function updateRoute(
  target: Function,
  handlerName: string,
  update: Partial<RouteDefinition>,
): void {
  const routes = getRoutes(target);

  const route = routes.find((item) => item.handlerName === handlerName);

  if (!route) {
    throw new Error(
      `Decorator usado antes de registrar a rota: ${handlerName}`,
    );
  }

  Object.assign(route, update);
}
