# 011 — Dashboard avançado (receita, conversões, empresas anunciantes)

**Status:** 🟡 Usuários conectados/tempo médio implementado — receita/conversões/empresas anunciantes aguardando detalhe do modelo de cobrança

## Contexto

MODEL.MD lista no Dashboard: impressões, cliques, CTR, conversões, receita, campanhas ativas, usuários conectados, tempo médio conectado, empresas anunciantes, produtos mais clicados. A task 001 entregou impressões/cliques/CTR/ranking de itens. Os demais indicadores ficaram fora porque dependem de conceitos que não existem em nenhum lugar do sistema ainda.

## Escopo

- **Receita / empresas anunciantes**: pressupõe que existe cobrança de anunciantes pela veiculação de campanha — hoje não há nenhum modelo de "cliente anunciante paga pra anunciar" no sistema. Isso é na verdade uma feature de negócio inteira (planos de anúncio, faturamento, talvez até um painel self-serve pra empresas locais comprarem espaço) — não é uma query nova num dashboard.
- **Conversões**: exige definir o que conta como conversão (compra no link de afiliado? resgate de cupom? cadastro de lead?) e um jeito de rastrear isso — pra afiliados externos (Shopee, Amazon etc.) isso normalmente vem de um postback/webhook do próprio programa de afiliados (relacionado à task 008), não é algo que dá pra medir só do lado do hotspot.
- **Usuários conectados / tempo médio conectado**: esses dados já existem (`radacct`, `connection_logs`, dashboard principal do admin já mostra parte disso) — só precisaria agregar e cruzar com campanhas, é o item de menor esforço desta lista.

## Recomendação

Não é uma task única — "usuários conectados/tempo médio" pode entrar como extensão pontual do dashboard de campanhas (baixo esforço, dado já existe). Receita/conversões/empresas anunciantes dependem de decisões de modelo de negócio (como a Surb vai cobrar anunciantes?) que precisam ser resolvidas com o usuário antes de qualquer schema.

## Escopo entregue (usuários conectados / tempo médio conectado)

Sem migration nova — só agregação em cima de `connection_logs` (já teria `empresa_id`, `mac`, `nas_ip`, `inicio_conexao`, `duracao_segundos`, todos já indexados).

- `backend/src/controllers/campanhasController.js` — nova função `buscarConexoes(empresaId, de, ate, nasIps?)`: `COUNT(DISTINCT mac)` + `AVG(duracao_segundos)` no período.
  - `metricasGerais` (dashboard geral de campanhas): `conexoes` = total da empresa no período (sem filtro de hotspot).
  - `metricasCampanha` (métricas de uma campanha específica): `conexoes` restrito aos `nas_ip` dos MikroTiks vinculados ao(s) portal(is) que usam essa campanha (mesmo join de `portais.campanha_ativa_id` → `mikrotiks.portal_id` já usado em `liberarDominiosAfiliado`, usando `mikrotiks.ip` OU `mikrotiks.vpn_ip` como no `syncConnectionLogs.js`). Se a campanha não está vinculada a nenhum portal ainda, `conexoes` vem `null` (não faz sentido mostrar o total da empresa como se fosse desta campanha).
- `frontend/src/pages/admin/Campanhas.jsx` e `frontend/src/pages/admin/CampanhaEditor.jsx` — novo `StatCard.Row` com "Usuários conectados" e "Tempo médio conectado", condicionado a `metricas.conexoes` existir.

### Limitação consciente

Não é uma métrica "quantos desses usuários viram a campanha" — é "quantos usuários conectaram nos hotspots que exibem essa campanha", no mesmo período. Não há vínculo direto entre uma sessão RADIUS e uma impressão de campanha (impressão não grava MAC), então essa é uma correlação por hotspot/período, não uma atribuição individual.

## Pendente — Receita / Conversões / Empresas anunciantes

Ainda bloqueado: perguntei ao usuário como funcionaria a cobrança de anunciantes (plano fixo? CPM/CPC? faturamento manual fora do sistema?) e quem são os "anunciantes" (empresas parceiras locais vs. o próprio cliente dono do hotspot). Resposta ainda não detalhada nesta sessão — não escrever schema de receita/conversão até isso ficar claro.
