# 010 — Segmentação avançada (cidade, perfil do usuário, primeiro acesso, nº de acessos)

**Status:** 🟡 "Primeiro acesso" implementado — demais critérios (cidade, perfil, nº de acessos) seguem pendentes

## Contexto

A task 001 implementou segmentação por data/horário/dia da semana/dispositivo/SO/hotspot específico. MODEL.MD lista mais critérios que ficaram de fora conscientemente: cidade, bairro, perfil do usuário, faixa etária, sexo, histórico de acesso, primeiro acesso, tempo conectado, número de acessos.

## Escopo

Cada critério tem uma dependência diferente — não é um bloco único:

- **Cidade/bairro**: nem `mikrotiks` nem `portais` têm coluna de localização hoje. Precisaria de cadastro manual (campo novo em `mikrotiks`, já que cada hotspot é fisicamente um lugar) ou geolocalização por IP (mais frágil, hotspot geralmente tem IP privado/CGNAT).
- **Primeiro acesso / número de acessos / tempo conectado**: exige cruzar com `radacct`/`connection_logs`/`leads` por MAC — a rota pública de campanha (`GET /api/public/campanha/:portalId`) hoje **não recebe o MAC do cliente**, só `portalId` e os query params de dispositivo/SO/mikrotik adicionados na task 001. Passar a receber MAC muda o contrato da rota e levanta a questão de que a campanha só pode ser resolvida depois que o MikroTik identifica o cliente (o que já acontece no fluxo, só não é passado pra esse endpoint hoje).
- **Perfil do usuário / faixa etária / sexo**: dados que só existem se o usuário já se cadastrou (LGPD/lead) — não dá pra segmentar por isso *antes* do cadastro, que é justamente quando a campanha toca hoje (ver `project_fluxo_propaganda_escolha` na memória do projeto: propaganda toca antes do cadastro nos portais grátis).

## Recomendação

Tratar "primeiro acesso" como o item de menor esforço pra puxar essa task (só precisa checar se o MAC já apareceu em `radacct`/`leads`, dado que MAC já está disponível no fluxo de redirect mesmo que não chegue no endpoint da campanha ainda). Os demais critérios dependem de dado que ainda não existe no sistema — não são só "mais uma coluna JSON", como foi task 001.

## Escopo entregue ("primeiro acesso" / "recorrente")

Novo campo `campanhas.regra_acesso ENUM('qualquer','primeiro_acesso','recorrente') NOT NULL DEFAULT 'qualquer'`.

- `backend/migrations/029_campanha_regra_acesso.js` — adiciona a coluna + `INDEX idx_leads_empresa_mac (empresa_id, mac)` em `leads` (necessário porque o critério passou a rodar num endpoint público chamado a cada visita ao portal — sem índice seria full table scan a cada carregamento de campanha).
- `backend/src/utils/campanhaSegmentacao.js` — valida `regra_acesso` junto das demais regras.
- `backend/src/controllers/campanhasController.js` — `atualizar` persiste `regra_acesso`.
- `backend/src/controllers/campanhasPublicController.js` — `buscarCampanhaAtivaDoPortal` (helper compartilhado por `obterPorPortal` e `obterPopupPorPortal`, criado na task 007) agora aceita `mac` e, quando a campanha tem `regra_acesso != 'qualquer'`, checa `leads WHERE empresa_id = ? AND mac = ?` pra decidir se esse MAC é "primeiro acesso" (sem registro) ou "recorrente" (já tem registro). **Sem `mac` informado, a campanha não aparece** quando a regra não é "qualquer" — mesmo comportamento já usado pra dispositivo/sistema operacional ausentes (task 001).
- `frontend/src/pages/public/CampanhaPlayer.jsx` — agora envia `mac` (já lido da URL, `macParam`) na busca inicial da campanha (`GET /api/public/campanha/:portalId?...&mac=...`) — essa era a mudança de contrato que a task apontava como bloqueio; passar a receber é so' isso, um query param a mais, opcional.
- `frontend/src/pages/admin/CampanhaEditor.jsx` — `SegmentedControl` "Qualquer / Só 1º acesso / Só recorrente" na seção "Agendamento e Segmentação".

### Decisões e limitações conscientes

1. **Só verifica `leads`, não `radacct`.** `radacct.callingstationid` não tem índice, e essa checagem roda num endpoint público de alto tráfego (toda visita ao portal) — um full table scan ali seria arriscado em produção com uma tabela de accounting que só cresce. `leads` é bem menor e ganhou índice dedicado. Isso significa: um cliente que só tem sessão RADIUS/pagamento aprovado mas nunca passou por um formulário de cadastro (LGPD/Lead/Planos) que grava em `leads` pode ser classificado incorretamente como "primeiro acesso" mesmo já tendo usado o hotspot antes. Aceitável pro escopo desta task; se isso virar problema real, vale revisitar com um índice em `radacct` ou uma tabela de resumo por MAC.
2. **Pop-up pós-login (task 007, `obterPopupPorMikrotik`) não recebe `mac`/`regra_acesso`.** Cliente pós-login já está numa sessão ativa — a distinção "primeiro/recorrente" é mais natural no fluxo pré-login (onde esse critério foi pensado) e não foi estendida pro Advertise do MikroTik.
3. **Cidade/bairro, perfil do usuário, faixa etária/sexo, nº de acessos, tempo conectado continuam pendentes** — dependem de dado que ainda não existe no sistema (coluna de localização em `mikrotiks`, contagem de sessões por MAC), não é extensão simples como "primeiro acesso" foi.

## Verificação

Migration não executada contra o banco nesta sessão (sem dev server ativo) — só `node --check` (sintaxe) nos arquivos backend e bundle-check (esbuild) nos arquivos frontend. Falta: rodar a migration, criar uma campanha com `regra_acesso = 'primeiro_acesso'`, e confirmar na prática que ela some da resposta pública depois que o MAC de teste aparecer em `leads`.
