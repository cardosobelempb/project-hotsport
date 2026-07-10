# 012 — Ad Server real: rotação/leilão entre campanhas concorrentes

**Status:** 🟢 Implementado (round-robin simples, sem peso/leilão)

## Contexto

O "principal diferencial" descrito no MODEL.MD é um Ad Server próprio que permite múltiplas empresas anunciarem na mesma plataforma. Hoje a arquitetura é **1 campanha ativa por portal, fixa** (`portais.campanha_ativa_id`, relação 1:1) — não existe seleção dinâmica, priorização, rotação ou concorrência entre campanhas. É uma decisão consciente mantida em todas as tasks anteriores (001 e 002 não mexeram nisso).

## Escopo

Isso é uma mudança de arquitetura, não uma feature incremental:

1. **Modelo de seleção**: quando há múltiplas campanhas elegíveis pro mesmo portal (todas dentro da janela de agendamento/segmentação da task 001), qual toca? Round-robin simples, peso/prioridade configurável por campanha, leilão por lance (exigiria o conceito de "orçamento" que também não existe)?
2. **Mudança de schema**: `portais.campanha_ativa_id` (1:1) precisaria virar uma relação N:N (tabela de associação `portal_campanhas` com peso/prioridade), ou pelo menos uma lista de campanhas candidatas por portal.
3. **`campanhasPublicController.obterPorPortal`**: hoje resolve exatamente 1 campanha determinística. Precisaria de lógica de seleção (aleatória ponderada? round-robin com estado por sessão/MAC pra não repetir a mesma campanha toda hora?).
4. **Justo pra múltiplos anunciantes**: se a visão é "empresas locais e nacionais" concorrendo por espaço no mesmo hotspot, precisa de alguma forma de garantir distribuição justa de impressões entre elas — isso é o núcleo de qualquer ad server de verdade e não é trivial.

## Recomendação

Esta é provavelmente a task de maior risco arquitetural do backlog inteiro — depende de decisões de modelo de negócio (como as campanhas concorrentes são priorizadas? existe conceito de "cliente paga mais, aparece mais"?) que precisam vir do usuário antes de qualquer linha de código. Só faz sentido priorizar depois que a task 008 (marketplace de afiliados) ou algum modelo de cobrança de anunciante (task 011) estiver mais claro, já que rotação de campanha sem múltiplos anunciantes reais não tem valor de negócio pra testar.

## Decisão do usuário

Confirmado nesta sessão: (1) modelo de seleção = **round-robin simples**, sem peso/prioridade configurável e sem conceito de orçamento/leilão (fora de escopo — a task 011, que traria o modelo de cobrança de anunciante, continua pendente); (2) já existe demanda real de anunciantes concorrentes esperando pra rodar campanhas no mesmo portal, então a implementação foi priorizada mesmo com a 011 ainda em aberto.

## O que foi entregue

**Schema** (`backend/migrations/030_portal_campanhas.js`):
- Nova tabela `portal_campanhas` (portal_id, campanha_id) — N:N, substitui a relação 1:1 `portais.campanha_ativa_id`. UNIQUE(portal_id, campanha_id), FK CASCADE nos dois lados.
- Nova coluna `portais.campanha_rotacao_ultima_id` — ponteiro do round-robin (id da última campanha servida).
- Backfill automático: todo portal que já tinha `campanha_ativa_id` ganha o vínculo equivalente em `portal_campanhas`.
- `portais.campanha_ativa_id` **não foi removida** (DROP COLUMN é irreversível e o runner de migrations do projeto não usa transação em DDL — ver gotcha #2 do Sistema de Atualização). Fica órfã como rede de segurança; nenhum código novo lê mais dela.

**Seleção/rotação** (`backend/src/controllers/campanhasPublicController.js`):
- `buscarCampanhasElegiveisDoPortal`: junta `portal_campanhas`, aplica as mesmas regras de agendamento/segmentação que já existiam (data/horário/dias/dispositivo/SO/mikrotik/regra_acesso), ordena por id.
- `buscarCampanhaAtivaDoPortal`: se 0 elegíveis → null; se 1 → retorna direto; se 2+ → round-robin (pega a próxima com id maior que `campanha_rotacao_ultima_id`, wraparound pro início se não achar) e avança o ponteiro. Reaproveitada por `obterPorPortal`, `obterPopupPorPortal`, `obterPopupPorMikrotik` e por `campanhaPreacessoController` (exportada como `_buscarCampanhaAtivaDoPortal`).
- `registrarView`/`registrarEvento`/`responderPesquisa`: agora recebem/validam `campanha_id` contra `portal_campanhas` (antes comparavam com o `campanha_ativa_id` único do portal — não faz mais sentido com N:N, já que campanhas diferentes rotacionam entre chamadas).

**Admin** (`portalController.vincularCampanha` + `PortalEditor.jsx`): campo "Campanha ativa" (select único) virou "Campanhas vinculadas" (checkboxes múltiplos). Endpoint `PUT /api/portais/:portalId/campanha` agora recebe `{ campanha_ids: [...] }` (substitui a lista inteira, zera o ponteiro de rotação) em vez de `{ campanha_ativa_id }`. Novo `GET /api/portais/:portalId/campanha` lista os vínculos atuais.

**Outros pontos ajustados**: `campanhasController.js` (3 queries que checavam "campanha usada em quais portais"), `server.js` (checagem de pré-portal de propaganda), `CampanhaPlayer.jsx` (`/view` agora envia `campanha_id`), `estrutura.sql`, `tests/campanhas/test_publico.js`.

## Explicitamente fora de escopo

- Peso/prioridade por campanha, orçamento, leilão por lance — round-robin simples foi a escolha do usuário.
- Distribuição "justa" ponderada por valor pago — não existe conceito de pagamento de anunciante ainda (depende da task 011).

## Verificação

Migration **não executada** contra banco nesta sessão (sem `.env`/servidor de dev configurado no ambiente). Todos os arquivos passaram por `node --check` (sintaxe). Antes de depender disso em produção: rodar `node backend/migrations/030_portal_campanhas.js` num ambiente de dev, confirmar `DESCRIBE portal_campanhas` e `DESCRIBE portais` (nova coluna), vincular 2+ campanhas a um portal de teste pelo editor e confirmar que sucessivas chamadas a `GET /api/public/campanha/:portalId` alternam entre elas.
