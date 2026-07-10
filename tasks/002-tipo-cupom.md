# 002 — Novo tipo de campanha: Cupom

**Status:** ✅ Concluído

## Contexto

MODEL.MD lista "Cupom" como um dos tipos de campanha do Ad Server. Dos tipos que faltavam (Cupom, Pesquisa, Pesquisa de Satisfação, Promoção Local, Campanha Institucional, Pop-up), Cupom foi escolhido primeiro por ser o de menor escopo: segue o mesmo padrão estrutural dos tipos já existentes (`imagem`/`video`/`youtube`/`adsense`/`afiliado` em `campanha_itens`), sem precisar de infraestrutura nova como coleta de respostas (Pesquisa) ou um modo de exibição novo (Pop-up).

## Escopo entregue

Novo `tipo = 'cupom'` em `campanha_itens` com: código, tipo de desconto (percentual ou valor fixo), valor do desconto, validade (opcional, apenas informativa — não filtra automaticamente), descrição/regras, link opcional ("usar cupom").

Decisão de design: **sem tabela de resgate**. "Copiar código" e "usar cupom" reaproveitam o sistema de tracking de clique construído na task 001 — cada clique já conta como métrica de engajamento do item, sem precisar de uma tabela nova de resgates/unicidade por usuário.

## Arquivos-chave

- `backend/migrations/024_campanha_cupom.js` — ENUM `tipo` ganha `'cupom'` + colunas `cupom_codigo`, `cupom_desconto_tipo`, `cupom_desconto_valor`, `cupom_validade`, `cupom_descricao`, `cupom_link`.
- `backend/src/controllers/campanhasController.js` — `criarItemCupom` + branch `cupom` em `atualizarItem` (reaproveita `liberarDominiosAfiliado` pro walled garden quando há link).
- `backend/src/routes/campanhasRoutes.js` — `POST /:id/itens/cupom`.
- `backend/src/controllers/campanhasPublicController.js` — colunas `cupom_*` incluídas no SELECT público.
- `frontend/src/pages/admin/CampanhaEditor.jsx` — aba "Cupom" no editor de itens.
- `frontend/src/pages/public/CampanhaPlayer.jsx` — card do cupom (código + "copiar" + "usar cupom"), tracking de clique via `navigator.clipboard`.

## Como aplicar esse padrão a um tipo novo

Qualquer novo tipo de `campanha_itens` (ex: task 005/006) deve seguir esse mesmo esqueleto: ENUM + colunas prefixadas (`<tipo>_campo`), função `criarItem<Tipo>` + branch no `atualizarItem`, inclusão no SELECT público, aba no `SegmentedControl` do editor + `TIPO_TEMA`, branch de renderização no `CampanhaPlayer.jsx`. Ver `criarItemAfiliado`/`criarItemCupom` como referência mais completa (com validação de campos e liberação de walled garden).

## Verificação

Testado ponta a ponta: criação com validação (desconto >100% rejeitado, código vazio rejeitado), leitura pública, clique registrado, atualização (incluindo troca de link disparando liberação de walled garden), métricas refletindo o clique. Não testado clicando na UI num navegador real — ver task 003.
