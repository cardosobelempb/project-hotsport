Crie um novo use case seguindo os padrões do projeto.

Siga as convenções em:

- #file:'../instructions/conventions.instructions.md'
- #file:'../instructions/typescript.instructions.md'

Requisitos obrigatórios:

- Arquivo em `src/usecases/` com nome PascalCase verbo (ex: CreateWorkoutPlan.ts)
- Classe com método `execute`
- `InputDto` e `OutputDto` definidos no mesmo arquivo
- Chamar Prisma diretamente — sem repositories
- NUNCA usar try/catch
- NUNCA retornar o model Prisma — mapear para OutputDto
- Lançar erros customizados de `src/errors/index.ts`

Pergunte o nome da ação e da entidade se não fornecidos.
