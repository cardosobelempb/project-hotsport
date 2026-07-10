# 005 — Novo tipo de campanha: Pesquisa / Pesquisa de Satisfação

**Status:** ✅ Concluído

## Contexto

MODEL.MD lista "Pesquisa" e "Pesquisa de Satisfação" como tipos de campanha. É qualitativamente diferente dos tipos existentes (`imagem`/`video`/`youtube`/`adsense`/`afiliado`/`cupom`): esses só *exibem* conteúdo, uma pesquisa precisa **coletar resposta** do usuário.

## Decisões de design (confirmadas com o usuário antes de codar)

- **Formato**: um único tipo técnico `pesquisa`, com campo `formato` = `multipla_escolha` (2-6 opções) ou `escala` (1-5, fixo). Cobre tanto "Pesquisa" (múltipla escolha) quanto "Pesquisa de Satisfação" (escala) sem duplicar tipo no ENUM. Texto livre ficou fora de escopo (exigiria moderação e não agrega em gráfico).
- **Identificação do respondente**: vinculado ao MAC do dispositivo (mesmo padrão de `lgpd_logins`/`leads`), com `UNIQUE KEY (item_id, mac)` pra impedir a mesma pessoa responder 2x. MAC ausente (`NULL`) não é deduplicado — edge case aceito.
- **Visualização**: dentro do bloco "Métricas" já existente no `CampanhaEditor.jsx` (task 001), seção "Resultados de pesquisas" com barra de distribuição por opção/nota.

## Escopo entregue

- Novo `tipo = 'pesquisa'` em `campanha_itens`: `pesquisa_pergunta`, `pesquisa_formato`, `pesquisa_opcoes` (JSON, só pra múltipla escolha).
- Nova tabela `campanha_pesquisa_respostas`: `item_id`, `mac`, `resposta_opcao_index` (múltipla escolha) ou `resposta_nota` (escala 1-5), com dedup por `(item_id, mac)`.
- Endpoint público `POST /api/public/campanha/:portalId/pesquisa/responder` — valida item pertence à campanha ativa do portal, valida opção/nota dentro do range, grava resposta; duplicata (`ER_DUP_ENTRY`) retorna `200 {jaRespondeu:true}` sem travar o cliente.
- `GET /api/campanhas/:id/metricas` estendido com array `pesquisas`: por pergunta, total de respostas, média (só pra escala) e distribuição percentual por opção/nota.
- Editor: aba "Pesquisa" (pergunta, seletor de formato, textarea de opções com validação 2-6), card do item na grade, seção "Resultados de pesquisas" nas Métricas com barras de distribuição.
- Player público: card sem timer (diferente de todos os outros tipos) — fica esperando o cliente responder ou clicar "Pular"; captura o MAC já presente na URL do fluxo (`?mac=...`, propagado desde `server.js` no redirect de propaganda) e envia junto da resposta.

## Bug real encontrado e corrigido durante a verificação

O ambiente de dev roda em Docker Desktop/Windows com bind mount — **tanto o `nodemon` do backend quanto o `Vite` do frontend às vezes não pegam mudanças de arquivo automaticamente** (mesmo problema já visto nas tasks 001/002). Depois de várias edições sequenciais no `CampanhaEditor.jsx`, a aba "Pesquisa" simplesmente não aparecia na UI mesmo com o arquivo salvo corretamente no disco — `curl` no dev server confirmou que ele servia uma versão desatualizada (sem nenhuma ocorrência do texto "Pesquisa"). Resolvido com `docker restart hotspot-frontend`. **Lição pra próximas tasks**: se uma mudança de frontend não aparecer na UI após múltiplas edições em sequência, reiniciar o container antes de assumir que é bug de lógica.

## Verificação

Testado ponta a ponta com Playwright real (não só API): criação com validação (botão desabilitado sem pergunta/com 1 opção só), resposta real no player (MAC capturado da URL, POST confirmado no banco com o `resposta_opcao_index` correto), dedup funcionando (testado via API: mesmo MAC respondendo 2x é ignorado), e a agregação aparecendo corretamente no bloco de Métricas do admin (barra "Regular 1 (100%)" batendo com a resposta real dada no player). Dados de teste limpos do banco depois.

Confirmado também que **modo preview (`?preview=1`) não grava resposta real** — mesmo padrão já usado pra impressão/clique (task 001), intencional pra não poluir resultados de pesquisa com cliques do próprio admin testando o player.
