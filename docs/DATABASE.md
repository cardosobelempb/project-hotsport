# 🗄️ Banco de Dados e Prisma

## Stack

- **Banco:** PostgreSQL
- **ORM:** Prisma v7 com adapter `pg` (`@prisma/adapter-pg`)
- **Client:** `@prisma/client`

---

## Configuração do Prisma

### `prisma/schema.prisma`

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### `src/lib/prisma.ts` — Singleton obrigatório

```ts
// ✅ Sempre use singleton para evitar múltiplas conexões
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

// Pool de conexões configurável via env
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10 // máximo de conexões simultâneas
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
```

> ⚠️ **Erro comum:** instanciar `new PrismaClient()` dentro de funções
> cria uma nova conexão a cada chamada — isso esgota o pool rapidamente.

---

## Convenções de Schema

### Nomenclatura

```prisma
model Cliente {
  id         Int      @id @default(autoincrement())
  nome       String
  email      String   @unique
  cpf        String   @unique @db.VarChar(11)
  criadoEm  DateTime  @default(now()) @map("criado_em")
  atualizadoEm DateTime @updatedAt @map("atualizado_em")

  planos     Plano[]

  @@map("clientes") // nome real da tabela no banco = snake_case
}
```

**Regras:**

- Modelos Prisma: `PascalCase` (ex: `Cliente`, `PlanoPago`)
- Campos Prisma: `camelCase` (ex: `criadoEm`)
- Tabelas e colunas no banco: `snake_case` via `@map` e `@@map`
- Sempre incluir `criadoEm` e `atualizadoEm` em entidades de domínio

---

## Padrão Repository

```ts
// src/repositories/clienteRepository.ts

import { prisma } from '@/lib/prisma';
import type { CriarClienteInput } from '@/schemas/clienteSchema';

export const clienteRepository = {
  // Buscar por ID — retorna null se não encontrar (não lança exceção)
  async findById(id: number) {
    return prisma.cliente.findUnique({ where: { id } });
  },

  // Listar com paginação — sempre pagine, nunca retorne tudo
  async findMany(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return prisma.cliente.findMany({
      skip,
      take: limit,
      orderBy: { criadoEm: 'desc' }
    });
  },

  // Criar — retorna o registro criado
  async create(dados: CriarClienteInput) {
    return prisma.cliente.create({ data: dados });
  },

  // Atualizar — lança exceção se não encontrar
  async update(id: number, dados: Partial<CriarClienteInput>) {
    return prisma.cliente.update({ where: { id }, data: dados });
  },

  // Deletar soft (recomendado para auditoria)
  async softDelete(id: number) {
    return prisma.cliente.update({
      where: { id },
      data: { deletadoEm: new Date() }
    });
  }
};
```

---

## Migrações

```bash
# Criar nova migração (desenvolvimento)
npx prisma migrate dev --name descricao_da_mudanca

# Aplicar migrações em produção (sem criar nova)
npx prisma migrate deploy

# Inspecionar banco existente → gerar schema (primeira vez)
npx prisma db pull

# Gerar client após alterações no schema
npx prisma generate

# Visualizar dados (GUI)
npx prisma studio
```

### ⚠️ Regras de Migração

| Regra                                               | Motivo                              |
| --------------------------------------------------- | ----------------------------------- |
| Nunca edite arquivos `migrations/` manualmente      | Quebra o histórico e o checksum     |
| Sempre rode `prisma generate` após alterar o schema | O client fica desatualizado         |
| Use `migrate dev` apenas em desenvolvimento         | Em produção sempre `migrate deploy` |
| Nunca use `db push` em produção                     | Sem histórico de migração           |

---

## Referência de Schema SQL

O schema legado está em `backend/jobs/estrutura.sql`.  
Ao criar modelos Prisma, mantenha os nomes de tabela e coluna compatíveis com o SQL existente via `@map` e `@@map`.

---

## Postgres + Prisma + FreeRADIUS

### Separação de schemas

O banco Postgres é dividido em dois schemas para evitar acoplamento entre o app e o FreeRADIUS:

| Schema   | Responsável   | Tecnologia       | IDs             |
| -------- | ------------- | ---------------- | --------------- |
| `public` | App (backend) | Prisma + Fastify | UUID (`@db.Uuid`) |
| `radius` | FreeRADIUS    | Schema oficial PostgreSQL do FR | serial/bigserial |

> Não force UUID no schema `radius` — o schema oficial do FreeRADIUS usa `serial/bigserial` e isso garante compatibilidade em upgrades.

O Prisma gerencia exclusivamente o schema `public`. Para ler tabelas do `radius` (ex: relatórios de sessão via `radacct`), use queries raw ou uma conexão separada read-only.

### Tabelas do app (`public`)

As tabelas do app são gerenciadas pelo Prisma com IDs UUID:

- `users` — usuários do sistema com roles (RBAC)
- `mikrotiks` — equipamentos cadastrados
- `planos` — planos de acesso (velocidade, duração, valor)
- `pagamentos` — histórico de pagamentos
- `vouchers` — vouchers de acesso gerados pelo backend
- `config_mercadopago`, `efi_config` — configs de pagamento
- `lgpd_logins` — registros de aceite LGPD

### `users` e roles (RBAC)

A tabela `admins` do schema legado é substituída por `users` com enum de roles:

```prisma
enum UserRole {
  SUPER_ADMIN
  ADMIN
  SUPPORT
  FINANCE
  OPERATOR
}

model User {
  id          String    @id @default(uuid()) @db.Uuid
  email       String    @unique
  password    String
  role        UserRole  @default(ADMIN)
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  lastLoginAt DateTime? @map("last_login_at")

  @@map("users")
  @@schema("public")
}
```

- `SUPER_ADMIN` — acesso total
- `ADMIN` — operações administrativas gerais
- `SUPPORT` — leitura e ações limitadas de suporte
- `FINANCE` — acesso a pagamentos e configurações financeiras
- `OPERATOR` — operação de MikroTiks e planos

### Tabelas do FreeRADIUS (`radius`)

As tabelas do schema `radius` **não são gerenciadas pelo Prisma**. Elas devem ser criadas com o schema SQL oficial do FreeRADIUS para PostgreSQL (disponível em `raddb/mods-config/sql/main/postgresql/schema.sql`).

Principais tabelas (ver `docs/RADIUS.md` para detalhes):

| Tabela         | Função                                      |
| -------------- | ------------------------------------------- |
| `radcheck`     | Credenciais de autenticação por usuário     |
| `radreply`     | Atributos enviados ao NAS após aceite       |
| `radusergroup` | Associação usuário ↔ grupo                  |
| `radgroupcheck`| Verificações por grupo                      |
| `radgroupreply`| Atributos de resposta por grupo             |
| `radacct`      | Contabilização (sessões, tráfego, tempo)    |
| `radpostauth`  | Log pós-autenticação (aceites/rejeições)    |
| `nas`          | Clientes RADIUS (MikroTiks)                 |
