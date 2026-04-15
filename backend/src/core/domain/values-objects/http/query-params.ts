// QueryParams.ts
import { BaseParams } from './base-params'
import { SchemaDefinition } from './types'

export class QueryParams extends BaseParams {
  constructor(query: Record<string, any>, schema: SchemaDefinition) {
    super(query, schema)
  }
}
