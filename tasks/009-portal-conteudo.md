# 009 — Portal de Conteúdo

**Status:** 🔲 Pendente

## Contexto

MODEL.MD descreve um "Portal de Conteúdo" — site completo com notícias, eventos, promoções, cupons, guia comercial, produtos em destaque, empresas parceiras — separado do captive portal, onde o Google AdSense pode rodar com segurança (política do AdSense não recomenda anúncios em telas de login/captive portal). Hoje isso não existe em nenhuma forma: grep por "noticia", "evento", "cupom" (fora do escopo de campanha), "guia comercial" não retornou nenhum arquivo do projeto.

## Escopo

Esta é a maior task do backlog — não é uma extensão do que existe, é uma **superfície de produto inteiramente nova**:

1. Novo conjunto de tabelas (notícias, eventos, empresas parceiras, guia comercial) com isolamento multi-tenant (`empresa_id`), seguindo a convenção do projeto.
2. Novas rotas públicas (sem autenticação, como as páginas do captive portal) servindo esse conteúdo.
3. Novo conjunto de páginas frontend — provavelmente fora do padrão atual de `frontend/src/pages/public/` (que hoje é 100% fluxo de captive portal: login, planos, pagamento, LGPD), já que este é conceitualmente um site de conteúdo, não uma etapa de autenticação.
4. Painel admin pra criar/editar notícias, eventos, etc — mais CRUDs seguindo o kit de UI já padronizado (`frontend/src/components/ui/`).
5. Integração AdSense nesse portal (bem mais simples que a integração hoje em campanhas — aqui pode ser o script oficial do Google direto, sem as restrições de walled garden que forçaram o `mp-security.js` local no fluxo de pagamento).
6. Decisão de infraestrutura: esse portal vive no mesmo domínio/app do painel admin+captive portal atual, ou é uma aplicação Vite/rota separada? Afeta SEO (relevante pro AdSense) e a estrutura de deploy (nginx, `docker-compose.yml`).

## Recomendação

Não iniciar sem uma rodada de planejamento formal (Explore + Plan) dedicada só a essa task — é do tamanho de um módulo novo do produto, não um incremento. Vale validar com o usuário se há demanda de negócio confirmada antes de investir aqui, já que é a peça mais distante do que já existe.

## Decisão do usuário (2026-07-08)

**Demanda de negócio ainda não confirmada** — é só visão do MODEL.MD, sem pedido real de cliente/mercado até agora. Por isso **nenhum código foi escrito** (nem migration, nem rota, nem página) — a recomendação de pausar segue valendo.

Ainda assim, o usuário adiantou por texto as duas decisões de arquitetura do ponto 6 do escopo, pra quando a demanda for confirmada o planejamento formal (Explore + Plan) começar mais rápido:

1. **Mesmo domínio/app**: o Portal de Conteúdo entra na mesma stack React/Vite do painel admin + captive portal atual (não é projeto/subdomínio separado). Novas rotas fora do padrão de `frontend/src/pages/public/` (que hoje é 100% fluxo de captive portal), provavelmente um novo diretório tipo `frontend/src/pages/conteudo/`. Trade-off aceito conscientemente: deploy mais simples (mesmo nginx/docker-compose), mas SEO/reputação de domínio do portal de conteúdo fica acoplada ao domínio do captive portal — reavaliar se isso virar problema real pro AdSense.
2. **CRUD no painel admin atual**: notícias/eventos/parceiros/guia comercial são gerenciados dentro do admin existente, reaproveitando `AuthContext`, RBAC (grupos de permissão) e o kit de UI (`frontend/src/components/ui/`) — mesmo padrão de `Campanhas.jsx`, não um painel separado.

**Próximo passo, quando a demanda for confirmada**: rodar a rodada formal de Explore + Plan que a recomendação original pede, já partindo dessas duas decisões resolvidas.
