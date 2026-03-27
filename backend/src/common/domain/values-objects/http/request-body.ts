// RequestBody.ts
import { BaseParams } from './base-params'
import { SchemaDefinition } from './types'

export class RequestBody extends BaseParams {
  constructor(body: Record<string, any>, schema: SchemaDefinition) {
    super(body, schema)
  }
}
