# 008 — Marketplace de afiliados multi-programa

**Status:** 🟡 Modelo de dados definido — integração de API por programa ainda pendente

## Contexto

MODEL.MD descreve integração via API com múltiplos programas de afiliados: Shopee, Mercado Livre, Amazon, Hotmart, Eduzz, Monetizze, Braip, Awin, CJ Affiliate — com produtos exibidos automaticamente por categoria/campanha. Hoje o tipo `afiliado` em `campanha_itens` é só um card estático: o admin cola manualmente link, imagem, preço e descrição de um produto por vez.

## Escopo

Esta é uma das tasks maiores do backlog — depende de credenciais de API que a Surb ainda não tem para a maioria dessas plataformas. Antes de codar:

1. **Levantamento de credenciais**: quais programas de afiliados a Surb já tem conta/aprovação? Cada plataforma tem seu próprio processo de aprovação de afiliado (pode levar dias/semanas), então isso é bloqueador antes de qualquer integração técnica.
2. **Escopo mínimo viável**: começar por 1 programa (provavelmente Mercado Livre ou Amazon, que têm APIs de busca de produto mais documentadas) em vez dos ~9 listados no MODEL.MD de uma vez.
3. **Modelo de dados**: precisa de uma tabela de "programas de afiliados" configurados por empresa (`empresa_configs` já é o padrão do projeto pra credenciais por tenant — reaproveitar esse padrão em vez de criar tabela nova), e decidir se produtos importados viram `campanha_itens` (tipo `afiliado` já existente, só preenchido automaticamente) ou um catálogo separado que o admin escolhe manualmente pra incluir na campanha.
4. **Sincronização de preço/disponibilidade**: produtos de afiliado mudam de preço/saem de estoque — precisa de job periódico (o projeto já usa `node-cron`, ver `syncConnectionLogs.js`/`verificaExpiracoes.js` como padrão) pra manter os dados atualizados, ou aceitar que ficam desatualizados até o admin reeditar manualmente (like hoje).

## Recomendação

Tratar como projeto à parte, não uma extensão simples — precisa de uma rodada de exploração + plano formal (goes through Explore → Plan) antes de qualquer código, dado o tamanho da superfície (múltiplas APIs externas, cada uma com seu próprio contrato) e a dependência de credenciais externas que não estão sob nosso controle.

## Decisão do usuário

Confirmado: a Surb já tem conta/aprovação em Mercado Livre, Amazon (Associados) e nos demais programas listados no MODEL.MD (Shopee/Hotmart/Eduzz/Monetizze/Braip/Awin/CJ Affiliate). Ainda assim, integrar a API de cada plataforma (fluxo de auth, contrato de busca de produto, etc.) é trabalho por programa — não foi feito nesta sessão. O que foi pedido e entregue agora foi só o **modelo de dados**, sem nenhuma chamada real a API externa.

## Modelo de dados entregue

`backend/migrations/028_afiliado_programas.js`:

1. **Credenciais por programa — reaproveita `empresa_configs` literalmente** (não uma tabela nova): `config_type` ganha um valor por programa (`afiliado_mercadolivre`, `afiliado_amazon`, `afiliado_shopee`, `afiliado_hotmart`, `afiliado_eduzz`, `afiliado_monetizze`, `afiliado_braip`, `afiliado_awin`, `afiliado_cj`). Como o UNIQUE já é `(empresa_id, config_type)`, cada programa é seu próprio tipo — uma empresa pode ter os 9 programas configurados e ativos simultaneamente, sem precisar de tabela nova. `backend/src/controllers/empresaConfigController.js` já expõe isso: `GET/POST /api/empresa-config/:tipo` aceita qualquer um desses tipos agora (lista `CONFIG_TYPES`/`PROGRAMAS_AFILIADO` exportada pro resto do backend reaproveitar).
2. **Catálogo de produtos importados — tabela separada, não vira `campanha_itens` diretamente**: `afiliado_produtos_importados` (empresa_id, programa, produto_externo_id, título, imagem, preço, preço original, link, categoria, sincronizado_em). Decisão: produtos vindos da API formam um catálogo que o admin navega/pesquisa; ao escolher incluir um produto numa campanha, isso **copia os campos pra um `campanha_itens` tipo `afiliado` normal** (não faz join ao vivo) — o `CampanhaPlayer`/`CampanhaPopupCard`/validação do controller continuam exatamente como estão hoje, sem nenhuma mudança de contrato.
3. **Rastreabilidade**: `campanha_itens.produto_importado_id` (FK nullable pra `afiliado_produtos_importados`, `ON DELETE SET NULL`) — `NULL` = item de afiliado criado manualmente (comportamento de hoje, inalterado). Existe só pra permitir re-sync futuro (preço/estoque) sem redesenhar o item.

## Explicitamente fora de escopo nesta sessão (bloqueado/adiado)

- Nenhum cliente de API real (Mercado Livre, Amazon, etc.) foi implementado — cada plataforma tem seu próprio fluxo de autenticação e contrato de busca, e a recomendação original de escolher **1 programa como MVP** (ML ou Amazon) antes de generalizar continua válida.
- Nenhum job de sincronização de preço/disponibilidade (`node-cron`, padrão `syncConnectionLogs.js`) foi criado — a tabela `afiliado_produtos_importados` existe mas fica vazia até um job real popular/atualizar.
- Nenhuma UI de admin foi criada pra: cadastrar credenciais por programa, navegar o catálogo importado, ou "adicionar à campanha" a partir do catálogo. O formulário de credenciais de cada programa também não foi desenhado (cada API tem campos diferentes: OAuth vs API key vs client_id/secret).

## Verificação

Migration não executada contra o banco nesta sessão (sem servidor de dev rodando) — só passou por `node --check` (sintaxe). Antes de depender dela: rodar `node backend/migrations/028_afiliado_programas.js` num ambiente de dev e confirmar `DESCRIBE empresa_configs` (novo ENUM) e `DESCRIBE afiliado_produtos_importados`/`campanha_itens` (nova coluna + FK).
