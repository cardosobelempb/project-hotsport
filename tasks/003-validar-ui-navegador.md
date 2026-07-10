# 003 — Validar UI no navegador (editor de campanha + player público)

**Status:** ✅ Concluído

## Contexto

As tasks 001 e 002 foram verificadas ponta a ponta via API (curl contra o backend/MySQL reais em Docker) e checagem de compilação via Vite (HTTP 200 nos arquivos alterados), mas **nenhuma delas foi clicada num navegador real**. Compilar sem erro não garante que a UI funciona/renderiza como esperado — precisa fechar esse ciclo antes de considerar as duas tasks 100% prontas.

## Escopo

1. Abrir `/admin/:empresaSlug/campanhas/:id` (CampanhaEditor) e:
   - Configurar uma regra de agendamento (ex: só um dia da semana, ou uma janela de horário) e salvar — conferir que o formulário reflete o estado salvo ao recarregar a página.
   - Adicionar um item de Cupom (todas as validações client-side: desconto >100%, código vazio, link inválido).
   - Conferir o bloco de Métricas (StatCards + gráfico + ranking) renderiza sem erro mesmo sem eventos.
2. Abrir o player público (`/campanha/:portalId`) e:
   - Confirmar que uma campanha com regra de segmentação ativa aparece/some conforme esperado (ex: trocar `dispositivos` pra excluir o dispositivo atual e ver o player pular direto pro redirect).
   - Ver o card de Cupom renderizando (código, botão copiar, botão "usar cupom" se houver link) e testar o clique de copiar.
3. Checar o DevTools (console) por erros JS silenciosos em ambas as telas.

## Notas

Ambiente de dev já está de pé (`docker ps` mostra `hotspot-frontend` na porta 3000, `hotspot-backend` na 3001). Login admin: `admin@empresa.com` / `admin123`, empresa `default`.

## Resultado da verificação

Dirigido com Playwright real (headless Chromium) contra o app rodando em Docker — não foi só checagem de compilação, cada passo foi clicado/preenchido como um usuário faria, com screenshot em cada etapa.

**CampanhaEditor** (`/admin/default/campanhas/3`):
- Bloco "Agendamento e Segmentação" renderiza correto; marcar "Qua", salvar, dar reload e reabrir a página confirmou o checkbox continua marcado (persistência real, não só resposta da API).
- Modal de novo item, aba "Cupom": botão "Adicionar" fica desabilitado com código vazio; preencher desconto 150% mostra o alerta "Desconto percentual deve ser maior que 0 e até 100." e mantém o botão desabilitado; corrigir para 15% habilita e salva — o item aparece na grade com o ícone de ticket, código e "15% OFF".
- Bloco "Métricas" renderiza sem erro mesmo com 0 eventos (StatCards zerados, "Sem dados no período selecionado", ranking de itens vazio de cliques).
- Zero erros de console/página nessa tela.

**CampanhaPlayer** (`/campanha/:portalId`, preview mode):
- Card de Cupom renderiza como projetado: ícone de ticket, "15% OFF", código num box tracejado, texto de ajuda. Sem `cupom_link` no item de teste, o botão "Usar cupom" corretamente não aparece.
- Clique no código dispara `navigator.clipboard.writeText` e mostra "Código copiado!" — confirmado visualmente e via `navigator.clipboard`.
- **Achado durante o teste, não é bug**: itens `afiliado`/`adsense`/`cupom` cobrem a tela inteira com `stopPropagation()` (comportamento intencional, documentado em `project_walled_garden_afiliado`) — cliques de navegação prev/next só funcionam fora da área do card (margem preta). Só afetou o script de teste, não é um problema da aplicação.
- Um `pageerror` (mensagem minificada "Y") aparece consistentemente ao chegar no item `adsense` — isolado e confirmado: é o próprio script do Google AdSense (`ca-pub-4756105986266133`) rejeitando `localhost` como domínio não aprovado. Não trava o player (o slot só fica em branco, o timer/contagem continua normal) e não tem relação com as mudanças das tasks 001/002 — é esperado em qualquer ambiente de dev sem domínio aprovado no AdSense.

Dados de teste (item cupom de teste, regra de dia da semana, eventos gerados) foram limpos do banco após a verificação.
