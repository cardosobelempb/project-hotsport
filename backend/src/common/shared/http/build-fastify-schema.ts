import type { FastifySchema } from "fastify";
import { RouteDefinition } from "./decorators/types";

export function buildFastifySchema(route: RouteDefinition): FastifySchema {
  const schema: FastifySchema = {};

  // Docs
  if (route.docs?.tags) {
    schema.tags = route.docs.tags;
  }

  if (route.docs?.summary) {
    schema.summary = route.docs.summary;
  }

  if (route.docs?.description) {
    schema.description = route.docs.description;
  }

  // Zod schemas
  if (route.schema?.body) {
    schema.body = route.schema.body;
  }

  if (route.schema?.params) {
    schema.params = route.schema.params;
  }

  if (route.schema?.query) {
    schema.querystring = route.schema.query;
  }

  if (route.schema?.response) {
    schema.response = route.schema.response;
  }

  return schema;
}
