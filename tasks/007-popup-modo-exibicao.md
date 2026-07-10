# 007 — Pop-up como modo de exibição

**Status:** ✅ Implementado (Parte C não testada em hardware real — ver Verificação)

## Contexto

MODEL.MD lista "Pop-up" e "Banner Full Screen" como tipos de campanha. Diferente dos outros tipos pendentes, Pop-up **não é um tipo de conteúdo** — é um *modo de exibição* diferente: interromper a navegação do usuário fora da sequência normal de stories do `CampanhaPlayer.jsx`, disparado por outro evento em vez de sempre tocar no fluxo pré-cadastro.

## Decisões do usuário

1. Pop-up deve funcionar **nos dois contextos**: pré-login (durante cadastro) e pós-login (cliente já autenticado navegando).
2. **Reaproveita item de campanha existente** (imagem/afiliado/cupom etc.) com um "modo de exibição" diferente — não é tipo técnico novo.
3. Frequência: **1x por sessão de conexão**.
4. Entrega pós-login: **redirect HTTP periódico via MikroTik**.
5. No pré-login, o pop-up deve poder aparecer em **todas as telas do cadastro** (não só na entrada).

## Escopo entregue

### Parte A — Schema e Admin
- `backend/migrations/027_campanha_modo_exibicao.js` — `campanha_itens.modo_exibicao ENUM('sequencia','popup') NOT NULL DEFAULT 'sequencia'`.
- `backend/src/controllers/campanhasController.js` — todo `criarItem*`/`uploadItem`/`atualizarItem` aceita e valida `modo_exibicao`.
- `frontend/src/pages/admin/CampanhaEditor.jsx` — `SegmentedControl` "Sequência"/"Pop-up" no modal de item + badge "Pop-up" no card da lista.

### Parte B — Pop-up pré-login
- `backend/src/controllers/campanhasPublicController.js` — `obterPorPortal` agora filtra `modo_exibicao = 'sequencia'` (não duplica item pop-up na sequência); nova `obterPopupPorPortal` (`GET /:portalId/popup`) e `obterPopupPorMikrotik` (`GET /popup/mikrotik/:mikrotikId`, usada pela Parte C).
- `frontend/src/components/public/CampanhaPopupCard.jsx` — renderiza um item (imagem/afiliado/cupom/video/youtube/adsense) sem timer/auto-avanço, só dispensável. `pesquisa` não renderiza no pop-up (exigiria persistência de estado fora de escopo).
- `frontend/src/components/public/PublicBanners.jsx` — estendido com props `portalId`/`mikrotikId`: busca o pop-up, mostra overlay dispensável 1x por sessão (`sessionStorage`), registra impressão/clique em `campanha_eventos` (só quando há `portalId` — ver gotcha abaixo).
- Prop `portalId`/`mikrotikId` propagada pra `<PublicBanners>` em: `LoginHotspot` (só `mikrotikId`), `PlanosCliente`, `CadastroCliente`, `CadastroLGPD`, `CadastroLead`, `CadastroLeadPassivo` (só `mikrotikId`), `CadastroTrialTempo`, `PortalReconexao`, `EscolhaAcesso`. **Não** adicionado em `Pagamento.jsx`/`AcessoAtivo.jsx` (checkout e status de acesso — não é hora de interromper).

### Parte C — Pop-up pós-login via Advertise nativo do MikroTik (best-effort)
- Novo toggle em `portais.configuracoes`: `popup_pos_login_enabled` + `popup_pos_login_intervalo_minutos`, editável em `frontend/src/pages/admin/PortalEditor.jsx` (seção "Pop-up pós-login", abaixo de Notificação WhatsApp, visível pra qualquer tipo de portal).
- `backend/src/utils/hotspotSetup.js` — na etapa "Hotspot Profile", quando o toggle está ligado: `advertise=yes`, `advertise-url` apontando pra `/campanha-popup` (nova página), `advertise-interval={min}m,10000d` (aproximação de "1x por sessão" — RouterOS não tem um "dispara só uma vez" nativo), `advertise-timeout=30s`. Quando desligado: `advertise=no` explícito (reversível reenviando o wizard).
- `frontend/src/pages/public/CampanhaPopupPage.jsx` (rota `/campanha-popup`) — página cheia, sem banners/layout, que busca o pop-up via `mikrotik_id` e devolve o cliente pra `orig` (URL original, `$(link-orig-esc)` do RouterOS) ao clicar "Continuar navegando".

## Gotchas gravados nesta implementação

1. **`LoginHotspot.jsx` e `CadastroLeadPassivo.jsx` não têm `portal_id` explícito na URL** (só `mikrotik_id`) — o pop-up nessas páginas resolve o portal via `mikrotiks.portal_id` (endpoint `popup/mikrotik/:id`) e **não registra evento de impressão/clique** em `campanha_eventos` (o endpoint de evento exige `portalId`). Métricas de pop-up nessas duas páginas ficam incompletas até isso ser resolvido, se vier a importar.
2. **`advertise-interval` "uma vez por sessão" é uma aproximação, não uma garantia.** RouterOS não documenta claramente o comportamento de repetição da lista de intervalos após o último valor ser consumido. Isso **precisa ser validado num MikroTik real** antes de confiar nesse comportamento em produção.
3. **Alterar o toggle "Pop-up pós-login" exige reenviar o wizard de hotspot** (botão no Mikrotiks) pra aplicar/remover o `advertise` no roteador — não é aplicado em tempo real como o restante das configs de portal.

## Verificação

- Migration, admin (criar/editar item com modo pop-up), e overlay pré-login (mostra 1x, `sessionStorage` bloqueia repetição, evento registrado): não executados nesta sessão (sem acesso ao banco/dev server rodando) — todos os arquivos novos/editados passaram por bundle-check via esbuild (sintaxe + resolução de imports OK), mas não foram exercitados em runtime.
- Parte C (Advertise do MikroTik): **não pode ser testada nesta sessão** — sem hardware real. Precisa de um teste manual num roteador de laboratório: ligar o toggle, reenviar o wizard, conectar um cliente, confirmar que o redirect do Advertise dispara (idealmente uma vez) e que "Continuar navegando" devolve o cliente pra `orig` corretamente.
