export type PrimitiveType = 'string' | 'number' | 'boolean'
export type ExtendedType = PrimitiveType | 'array'

export type FieldSchema =
  | PrimitiveType
  | {
      type: ExtendedType
      required?: boolean
      default?: any
      regex?: RegExp // para strings
      items?: PrimitiveType // para arrays
    }

export type SchemaDefinition = Record<string, FieldSchema>
