// RouteParams.ts
import { BaseParams } from './base-params'
import { SchemaDefinition } from './types'

export class RouteParams extends BaseParams {
  constructor(params: Record<string, any>, schema: SchemaDefinition) {
    super(params, schema)
  }
}
