Crie uma nova rota Fastify seguindo os padrões do projeto.

Siga as convenções em:

- #file:'../instructions/conventions.instructions.md'
- #file:'../instructions/typescript.instructions.md'

Requisitos obrigatórios:

- Arquivo em `src/routes/` com nome kebab-case
- Usar `withTypeProvider<ZodTypeProvider>()`
- Schema com `tags` e `summary` (Swagger)
- Validar sessão com `auth.api.getSession` se rota protegida
- Instanciar e chamar um use case
- Tratar erros com try/catch
- NUNCA colocar regras de negócio na rota

Pergunte o nome do domínio e os métodos HTTP se não fornecidos.
