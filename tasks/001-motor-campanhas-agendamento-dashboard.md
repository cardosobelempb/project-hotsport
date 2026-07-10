# 001 — Motor de campanhas: agendamento e segmentação + dashboard de métricas

**Status:** ✅ Concluído

## Contexto

O sistema de campanhas existente era essencialmente um CMS de carrossel (imagem/vídeo/YouTube/AdSense/afiliado) com liga/desliga binário por campanha e uma única métrica agregada (`views`). O MODEL.MD descreve um "Motor de Campanhas" com regras de agendamento e segmentação, e um "Dashboard" com impressões/cliques/CTR. Esse foi o primeiro incremento escolhido rumo à visão do MODEL.MD, por ser a base de que os demais pedaços (ranking, receita, inteligência de marketing) dependem.

## Escopo entregue

- Regras de agendamento/segmentação por campanha: data inicial/final, janela de horário (com suporte a janela noturna, ex. 22:00→06:00), dias da semana, dispositivos (mobile/desktop/tablet), sistemas operacionais, hotspots específicos.
- Tracking granular de impressão e clique por item de campanha (não só por campanha inteira).
- Dashboard: impressões, cliques, CTR, série diária, ranking de itens mais clicados — tanto agregado (todas as campanhas) quanto por campanha individual.
- Fora de escopo (decisão consciente): segmentação por cidade, perfil de usuário, primeiro acesso, número de acessos (exigiriam cruzar a rota pública com `leads`/`radacct` por MAC/CPF — mudança de contrato maior); receita, conversões, empresas anunciantes no dashboard (não existe cobrança de anunciante nem conversão rastreada ainda); rotação/leilão entre campanhas concorrentes (continua 1 campanha ativa por portal).

## Arquivos-chave

- `backend/migrations/023_campanha_segmentacao_tracking.js` — 8 colunas novas em `campanhas` (todas nullable) + tabela `campanha_eventos`.
- `backend/src/utils/campanhaSegmentacao.js` — validação das regras.
- `backend/src/controllers/campanhasController.js` — `atualizar` estendido, `obter` retorna `portais_vinculados`, novos endpoints `GET /api/campanhas/metricas` e `GET /api/campanhas/:id/metricas`.
- `backend/src/controllers/campanhasPublicController.js` — `obterPorPortal` avalia as regras no `WHERE` SQL; novo endpoint `POST /api/public/campanha/:portalId/evento`.
- `frontend/src/utils/deviceDetect.js`, `frontend/src/components/ui/MiniBarChart.jsx` (novos, sem dependência externa).
- `frontend/src/pages/admin/Campanhas.jsx`, `frontend/src/pages/admin/CampanhaEditor.jsx` — StatCards, gráfico, bloco "Agendamento e Segmentação".
- `frontend/src/pages/public/CampanhaPlayer.jsx` — envia dispositivo/SO/mikrotik_id no GET, reporta impressão (1x por item/sessão) e clique.

## Bugs reais encontrados e corrigidos durante a implementação

1. `SUM(condição booleana)` no MySQL retorna DECIMAL, que o `mysql2` serializa como string (`"1"` em vez de `1`) — trocado por `COUNT(CASE WHEN ... THEN 1 END)`.
2. **Bug mais sério**: o formulário de segmentação sempre envia arrays (nunca `null`) para os campos de checkbox. Como `[]` é *truthy* em JS, o controller gravava `[]` em vez de `NULL` — e `JSON_CONTAINS([], x)` nunca é verdadeiro, então qualquer campanha em que o admin salvasse essa aba sem marcar nada numa categoria **sumia do ar silenciosamente**. Corrigido normalizando lista vazia → `NULL` no `atualizar`. Ver a função `normalizarLista` em `campanhasController.js` — qualquer novo campo de lista/array nesse padrão deve reaproveitar essa normalização.

## Verificação

Testado ponta a ponta contra o MySQL/backend reais rodando em Docker (não só sintaxe): migration idempotente, gate de segmentação por dispositivo/dia/horário, validação de payload inválido, tracking de evento real, métricas agregadas batendo com os eventos gravados. Não testado clicando na UI num navegador real — ver task 003.
