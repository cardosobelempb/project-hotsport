import { BadRequestError } from '../../errors'
import {
  ExtendedType,
  FieldSchema,
  PrimitiveType,
  SchemaDefinition,
} from './types'

export class BaseParams {
  private readonly data: Record<string, any> = {}

  constructor(source: Record<string, any>, schema: SchemaDefinition) {
    for (const key in schema) {
      const field = schema[key]
      if (!field) {
        throw new BadRequestError(
          `Schema definition for field "${key}" is missing`,
        )
      }
      const definition = this.normalizeSchema(field)

      let value = source[key]
      const isMissing = value === undefined || value === null

      if (
        isMissing &&
        definition.required &&
        definition.default === undefined
      ) {
        throw new BadRequestError(`Missing required field: ${key}`)
      }

      if (isMissing && definition.default !== undefined) {
        value = definition.default
      }

      if (!isMissing) {
        this.data[key] = this.castValue(value, definition, key)
      }
    }
  }

  private normalizeSchema(field: FieldSchema): {
    type: ExtendedType
    required: boolean
    default?: any
    regex?: RegExp
    items?: PrimitiveType
  } {
    if (typeof field === 'string') {
      return { type: field as PrimitiveType, required: true }
    }

    return {
      type: field.type,
      required: field.required ?? true,
      default: field.default,
      regex: field.regex,
      items: field.items,
    }
  }

  private castValue(
    value: any,
    definition: ReturnType<typeof this.normalizeSchema>,
    key: string,
  ): any {
    const { type, regex, items } = definition

    if (type === 'array') {
      if (!Array.isArray(value)) {
        try {
          value = JSON.parse(value)
        } catch {
          throw new BadRequestError(`Field "${key}" must be a valid JSON array`)
        }
      }

      if (!Array.isArray(value)) {
        throw new BadRequestError(`Field "${key}" must be an array`)
      }

      if (items) {
        return value.map((item: any, i: number) =>
          this.castPrimitive(item, items, `${key}[${i}]`),
        )
      }

      return value
    }

    const casted = this.castPrimitive(value, type, key)

    if (type === 'string' && regex && !regex.test(casted)) {
      throw new BadRequestError(
        `Field "${key}" does not match pattern: ${regex}`,
      )
    }

    return casted
  }

  private castPrimitive(value: any, type: PrimitiveType, key: string): any {
    switch (type) {
      case 'number':
        const num = Number(value)
        if (isNaN(num))
          throw new BadRequestError(`Field "${key}" must be a number`)
        return num
      case 'boolean':
        if (value === true || value === 'true') return true
        if (value === false || value === 'false') return false
        throw new BadRequestError(`Field "${key}" must be a boolean`)
      case 'string':
      default:
        return String(value)
    }
  }

  public get(key: string) {
    return this.data[key]
  }

  public all() {
    return this.data
  }
}
