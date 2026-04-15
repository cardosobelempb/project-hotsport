### ✅ Etapas:

1. Alteramos o schema para aceitar:

* Tipo direto: 'string' | 'number' | 'boolean' (obrigatório)
* Ou um objeto com { type, required?, default? }

### ✅ Exemplo de Schema Estendido

```
const schema = {
  id: { type: 'number', required: true },
  active: { type: 'boolean', default: false },
  name: { type: 'string', required: true },
  age: { type: 'number', required: false },
};

```

### ✅ Atualizações nas Classes
### 📦 Tipo para Schema
* Crie isso em um arquivo comum (types.ts ou similar):

```
export type PrimitiveType = 'string' | 'number' | 'boolean';

export type FieldSchema =
  | PrimitiveType
  | {
      type: PrimitiveType;
      required?: boolean;
      default?: any;
    };

export type SchemaDefinition = Record<string, FieldSchema>;

```
### ✅ Atualizado: BaseParams.ts (classe genérica para herdar)

```
import { FieldSchema, PrimitiveType, SchemaDefinition } from './types';

export class BaseParams {
  private readonly data: Record<string, any> = {};

  constructor(source: Record<string, any>, schema: SchemaDefinition) {
    for (const key in schema) {
      const definition = this.normalizeSchema(schema[key]);

      let value = source[key];

      const isMissing = value === undefined || value === null;

      if (isMissing && definition.required && definition.default === undefined) {
        throw new Error(`Missing required field: ${key}`);
      }

      if (isMissing && definition.default !== undefined) {
        value = definition.default;
      }

      if (!isMissing) {
        this.data[key] = this.castValue(value, definition.type, key);
      }
    }
  }

  private normalizeSchema(field: FieldSchema): { type: PrimitiveType; required: boolean; default?: any } {
    if (typeof field === 'string') {
      return { type: field, required: true };
    }

    return {
      type: field.type,
      required: field.required ?? true,
      default: field.default,
    };
  }

  private castValue(value: any, type: PrimitiveType, key: string): any {
    switch (type) {
      case 'number':
        const num = Number(value);
        if (isNaN(num)) throw new Error(`Invalid number in field "${key}"`);
        return num;
      case 'boolean':
        if (value === true || value === 'true') return true;
        if (value === false || value === 'false') return false;
        throw new Error(`Invalid boolean in field "${key}"`);
      case 'string':
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

```
### ✅ Agora, especialize para RouteParams, QueryParams, e RequestBody

```
// RouteParams.ts
import { BaseParams } from './BaseParams';
import { SchemaDefinition } from './types';

export class RouteParams extends BaseParams {
  constructor(params: Record<string, any>, schema: SchemaDefinition) {
    super(params, schema);
  }
}

```
```
// QueryParams.ts
import { BaseParams } from './BaseParams';
import { SchemaDefinition } from './types';

export class QueryParams extends BaseParams {
  constructor(query: Record<string, any>, schema: SchemaDefinition) {
    super(query, schema);
  }
}

```

```
// RequestBody.ts
import { BaseParams } from './BaseParams';
import { SchemaDefinition } from './types';

export class RequestBody extends BaseParams {
  constructor(body: Record<string, any>, schema: SchemaDefinition) {
    super(body, schema);
  }
}

```
### ✅ Exemplo de uso

```
const routeParams = new RouteParams(req.params, {
  id: { type: 'number', required: true },
});

const queryParams = new QueryParams(req.query, {
  active: { type: 'boolean', default: false },
  filter: { type: 'string', required: false },
});

const body = new RequestBody(req.body, {
  name: 'string',
  age: { type: 'number', required: false, default: 18 },
});

```

### ✅ Exemplo de uso com regex e array

```
const body = new RequestBody(req.body, {
  name: { type: 'string', regex: /^[A-Za-z\s]+$/ }, // só letras e espaço
  tags: { type: 'array', items: 'string', default: [] }, // lista de strings
  scores: { type: 'array', items: 'number', required: false },
});

```

### Resultado
* name será validado com regex.

* tags precisa ser uma array de string, com valor padrão [].

* scores pode ser omitido, mas se enviado, deve ser uma array de números.

### Com isso, seu sistema de validação cobre: ✅ Tipos primitivos

1. ✅ Campos opcionais
2. ✅ Valores default
3. ✅ Regex para strings
4. ✅ Arrays com validação por tipo
