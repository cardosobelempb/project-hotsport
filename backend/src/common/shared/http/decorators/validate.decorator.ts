import type { ZodType } from "zod";
import { getRoutes } from "./metadata";

type ValidationSchema = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

/**
 * Adiciona validação Zod para body, params e querystring.
 *
 * Exemplo:
 * @Validate({ body: createUserSchema })
 */
export function Validate(schema: ValidationSchema) {
  return function (target: object, propertyKey: string | symbol): void {
    const routes = getRoutes(target.constructor);

    const route = routes.find(
      (item) => item.handlerName === String(propertyKey),
    );

    if (!route) {
      throw new Error(
        `@Validate precisa ser usado junto com um decorator de rota em ${String(propertyKey)}`,
      );
    }

    route.schema = schema;
  };
}
