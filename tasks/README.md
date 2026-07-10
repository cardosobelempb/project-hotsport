# Tasks — Rumo ao MODEL.MD (Surb Ad Server)

Backlog extraído da comparação entre `MODEL.MD` (visão de arquitetura de marketing/publicidade) e o estado real do código. Cada task é um arquivo próprio nesta pasta.

O objetivo do MODEL.MD é grande demais pra um único incremento — este backlog quebra em pedaços implementáveis. Ver `MODEL.MD` na raiz do projeto pra contexto completo da visão.

## Status

| # | Task | Status |
|---|------|--------|
| 001 | Motor de campanhas: agendamento e segmentação + dashboard de métricas | ✅ Concluído |
| 002 | Novo tipo de campanha: Cupom | ✅ Concluído |
| 003 | Validar UI no navegador (editor de campanha + player público) | ✅ Concluído |
| 004 | Remover tokens do WhatsApp Business expostos em PORTALS.md | ✅ Concluído (falta revogar os tokens no painel do Meta) |
| 005 | Novo tipo de campanha: Pesquisa / Pesquisa de Satisfação | ✅ Concluído |
| 006 | Novos tipos: Promoção Local / Campanha Institucional | 🔲 Pendente (avaliar se precisa de schema novo) |
| 007 | Pop-up como modo de exibição (não é tipo de item) | 🔲 Pendente |
| 008 | Marketplace de afiliados multi-programa (Shopee, ML, Amazon, Hotmart...) | 🔲 Pendente |
| 009 | Portal de Conteúdo (notícias/eventos/cupons/guia comercial + AdSense) | 🔲 Pendente |
| 010 | Segmentação avançada (cidade, perfil do usuário, primeiro acesso, nº de acessos) | 🔲 Pendente |
| 011 | Dashboard avançado (receita, conversões, empresas anunciantes) | 🔲 Pendente |
| 012 | Ad Server real: rotação/leilão entre campanhas concorrentes | 🔲 Pendente |

## Como usar

Cada arquivo tem: contexto (por que), escopo (o que exatamente), arquivos-chave envolvidos, e decisões/notas relevantes. Tasks concluídas documentam o que foi feito e onde, pra servir de referência de padrão pras próximas (ex: como adicionar um tipo novo de `campanha_itens` segue exatamente o padrão da task 002).

003, 004 e 005 concluídas. Da 006 em diante, cada task é independente das outras, escolher pela prioridade de negócio.
