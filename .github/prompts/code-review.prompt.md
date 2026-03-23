Faça um code review completo do arquivo atual.

Use como referência:

- #file:'../instructions/typescript.instructions.md'
- #file:'../instructions/conventions.instructions.md'

Verifique:

- Uso de `any` (deve ser zero)
- Arrow functions e nomenclatura com verbos
- Early returns (sem ifs aninhados)
- Se é rota: sem regras de negócio, tem tags/summary, trata erros
- Se é use case: sem try/catch, OutputDto mapeado, sem model Prisma direto
- Zod v4 com validadores semânticos (z.email(), z.iso.date(), etc.)
- dayjs para datas (nunca new Date() para formatação)

Formato da resposta:

1. ✅ O que está correto
2. ❌ O que precisa corrigir (com exemplo de correção)
3. 💡 Sugestões de melhoria
