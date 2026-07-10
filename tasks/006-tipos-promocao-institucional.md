# 006 — Novos tipos: Promoção Local / Campanha Institucional

**Status:** ✅ Concluído

## Contexto

MODEL.MD lista "Promoção Local", "Campanha Institucional" e "Oferta Patrocinada" como tipos de campanha separados. Na análise inicial, esses três parecem ser variações de rótulo/estilo do que já existe (`imagem` ou `afiliado`), não tipos funcionalmente novos.

## Escopo

Antes de criar ENUM/colunas novas, avaliar com o usuário:

1. **Promoção Local** — provavelmente cobre com `imagem` + título + descrição já existentes, talvez com campos extras de "empresa" (nome, endereço, telefone) se quiser exibir isso no card. Se for só isso, pode não precisar de tipo técnico novo — um `imagem` com título já resolve.
2. **Campanha Institucional** — conteúdo de marca/branding, também parece coberto por `imagem`/`video` já existentes.
3. **Oferta Patrocinada** — muito próximo do que `afiliado` já faz (produto com preço, desconto, link).

## Recomendação

Não implementar como tipos técnicos novos até confirmar com o usuário que os tipos existentes (`imagem`, `afiliado`) realmente não bastam. Se a necessidade real for só "rotular" a campanha por categoria de negócio (pra relatório/filtro, não pra renderização diferente), a solução mais barata é adicionar um campo `categoria` opcional na tabela `campanhas` (não em `campanha_itens`), sem duplicar lógica de renderização que já existe.

## Decisão do usuário

Confirmado: é só rótulo/categoria de negócio, sem necessidade de campos extras nem renderização diferente. `imagem`/`afiliado` já cobrem o conteúdo real dos três tipos do MODEL.MD.

## Escopo entregue

Campo opcional `campanhas.categoria` ENUM(`promocao_local`, `campanha_institucional`, `oferta_patrocinada`) NULL — vive na campanha (não no item), não afeta `campanha_itens` nem a renderização no `CampanhaPlayer.jsx`.

- `backend/migrations/026_campanha_categoria.js` — adiciona a coluna.
- `backend/src/controllers/campanhasController.js` — `criar` e `atualizar` validam/persistem `categoria` (lista `CATEGORIAS_CAMPANHA`); `atualizar` aceita `null` explícito pra limpar a categoria (não usa `COALESCE` como `nome`/`descricao`).
- `frontend/src/pages/admin/Campanhas.jsx` — Select de categoria no modal "Nova Campanha"; listagem mostra a categoria como linha secundária sob o nome (sem coluna nova, respeitando o limite de ~6 colunas).
- `frontend/src/pages/admin/CampanhaEditor.jsx` — bloco "Categoria" com Select + botão salvar próprio (PUT parcial, não reaproveita "Salvar regras" porque categoria não é regra de agendamento/segmentação).

## Verificação

Não testado na UI num navegador real nem a migration rodada contra o banco — ver task 003.
