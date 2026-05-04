import { BadRequestError } from "../../errors/controllers/bad-request.error";
import {
  ExtendedType,
  FieldSchema,
  PrimitiveType,
  SchemaDefinition,
} from "./types";

export class BaseParams {
  private readonly data: Record<string, any> = {};

  constructor(source: Record<string, any>, schema: SchemaDefinition) {
    for (const key in schema) {
      const field = schema[key];
      if (!field) {
        throw new BadRequestError({
          fieldName: key,
          message: `Field "${key}" is not defined in the schema`,
        });
      }
      const definition = this.normalizeSchema(field);

      let value = source[key];
      const isMissing = value === undefined || value === null;

      if (
        isMissing &&
        definition.required &&
        definition.default === undefined
      ) {
        throw new BadRequestError({
          fieldName: key,
          message: `Field "${key}" is required`,
        });
      }

      if (isMissing && definition.default !== undefined) {
        value = definition.default;
      }

      if (!isMissing) {
        this.data[key] = this.castValue(value, definition, key);
      }
    }
  }

  private normalizeSchema(field: FieldSchema): {
    type: ExtendedType;
    required: boolean;
    default?: any;
    regex?: RegExp;
    items?: PrimitiveType;
  } {
    if (typeof field === "string") {
      return { type: field as PrimitiveType, required: true };
    }

    const result: {
      type: ExtendedType;
      required: boolean;
      default?: any;
      regex?: RegExp;
      items?: PrimitiveType;
    } = {
      type: field.type,
      required: field.required ?? true,
    };

    if (field.default !== undefined) {
      result.default = field.default;
    }

    if (field.regex !== undefined) {
      result.regex = field.regex;
    }

    if (field.items !== undefined) {
      result.items = field.items;
    }

    return result;
  }

  private castValue(
    value: any,
    definition: ReturnType<typeof this.normalizeSchema>,
    key: string,
  ): any {
    const { type, regex, items } = definition;

    if (type === "array") {
      if (!Array.isArray(value)) {
        try {
          value = JSON.parse(value);
        } catch {
          throw new BadRequestError({
            fieldName: key,
            message: `Field "${key}" must be an array or a JSON string representing an array`,
          });
        }
      }

      if (!Array.isArray(value)) {
        throw new BadRequestError({
          fieldName: key,
          message: `Field "${key}" must be an array`,
        });
      }

      if (items) {
        return value.map((item: any, i: number) =>
          this.castPrimitive(item, items, `${key}[${i}]`),
        );
      }

      return value;
    }

    const casted = this.castPrimitive(value, type, key);

    if (type === "string" && regex && !regex.test(casted)) {
      throw new BadRequestError({
        fieldName: key,
        value,
        message: `Field "${key}" does not match the required format`,
      });
    }

    return casted;
  }

  private castPrimitive(value: any, type: PrimitiveType, key: string): any {
    switch (type) {
      case "number":
        const num = Number(value);
        if (isNaN(num))
          throw new BadRequestError({
            fieldName: key,
            value,
            message: `Field "${key}" must be a number`,
          });
        return num;
      case "boolean":
        if (value === true || value === "true") return true;
        if (value === false || value === "false") return false;
        throw new BadRequestError({
          fieldName: key,
          value,
          message: `Field "${key}" must be a boolean (true/false)`,
        });
      case "string":
      default:
        return String(value);
    }
  }

  public get(key: string) {
    return this.data[key];
  }

  public all() {
    return this.data;
  }
}
