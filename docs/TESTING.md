# 🧪 Estratégia de Testes

## Contexto Atual

> ⚠️ Testes não estão implementados (`npm test` retorna erro intencionalmente).  
> Este documento define a **estratégia a ser adotada** conforme o projeto evolui.

---

## Stack de Testes Recomendada

```bash
npm install -D vitest @vitest/coverage-v8 supertest @types/supertest
```

| Ferramenta            | Propósito                          |
| --------------------- | ---------------------------------- |
| `vitest`              | Runner de testes (compatível Vite) |
| `supertest`           | Testes de integração HTTP          |
| `@vitest/coverage-v8` | Cobertura de código                |

---

## Estrutura de Pastas

```
backend/
└── src/
    ├── services/
    │   ├── clienteService.ts
    │   └── clienteService.test.ts   ← testes unitários ao lado do arquivo
    └── __tests__/
        └── integration/
            └── clientes.test.ts     ← testes de integração HTTP
```

---

## Pirâmide de Testes

```
        /\
       /E2E\          ← poucos, lentos, testam fluxo completo
      /──────\
     /Integração\     ← médio, testam endpoints HTTP reais
    /────────────\
   /   Unitários  \   ← muitos, rápidos, testam services/utils
  /────────────────\
```

---

## Exemplo: Teste Unitário de Service

```ts
// src/services/clienteService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clienteService } from './clienteService';
import { clienteRepository } from '@/repositories/clienteRepository';

// Mock do repositório — isola o service do banco
vi.mock('@/repositories/clienteRepository');

describe('ClienteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('criar()', () => {
    it('deve criar cliente com dados válidos', async () => {
      // Arrange — preparar dados e mocks
      const dadosEntrada = {
        nome: 'João Silva',
        email: 'joao@email.com',
        cpf: '12345678901'
      };
      const clienteCriado = { id: 1, ...dadosEntrada, criadoEm: new Date() };
      vi.mocked(clienteRepository.create).mockResolvedValue(clienteCriado);

      // Act — executar a função
      const resultado = await clienteService.criar(dadosEntrada);

      // Assert — verificar resultado
      expect(resultado).toEqual(clienteCriado);
      expect(clienteRepository.create).toHaveBeenCalledWith(dadosEntrada);
    });

    it('deve lançar erro se CPF já existe', async () => {
      vi.mocked(clienteRepository.findByCpf).mockResolvedValue({
        id: 99
      } as any);

      await expect(
        clienteService.criar({
          nome: 'João',
          email: 'j@j.com',
          cpf: '12345678901'
        })
      ).rejects.toThrow('CPF já cadastrado');
    });
  });
});
```

---

## Exemplo: Teste de Integração HTTP

```ts
// src/__tests__/integration/clientes.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '@/app';

describe('POST /api/clientes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve retornar 201 ao criar cliente válido', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/clientes',
      headers: { authorization: 'Bearer token_teste' },
      payload: { nome: 'Maria', email: 'maria@email.com', cpf: '98765432100' }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ nome: 'Maria' });
  });
});
```

---

## Comandos

```bash
# Rodar todos os testes
npx vitest

# Modo watch (desenvolvimento)
npx vitest --watch

# Com cobertura
npx vitest --coverage

# Apenas um arquivo
npx vitest clienteService
```

---

## Metas de Cobertura (a atingir)

| Camada      | Meta |
| ----------- | ---- |
| `services/` | 80%  |
| `utils/`    | 90%  |
| `routes/`   | 60%  |
| Global      | 70%  |
