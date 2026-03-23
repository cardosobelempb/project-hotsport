Crie uma nova migration Prisma para o projeto.

Use como referência:

- #file:'../instructions/database.instructions.md'

Requisitos:

- Alterações no `prisma/schema.prisma` com convenções corretas
  - Modelos: PascalCase
  - Campos: camelCase
  - Tabelas/colunas no banco: snake_case via @map e @@map
  - Sempre incluir createdAt e updatedAt
- Comando para gerar: `npm run prisma migrate dev --name descricao`
- Rodar `npm run prisma generate` após a migration

NUNCA editar arquivos em `prisma/migrations/` manualmente.

Pergunte o que precisa ser alterado no schema se não fornecido.
