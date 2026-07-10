# 004 — Remover tokens do WhatsApp Business expostos em PORTALS.md

**Status:** 🔲 Pendente

## Contexto

Achado incidental durante a exploração do MODEL.MD: o arquivo `PORTALS.md` (raiz do projeto, linhas ~100-106) contém em texto puro:

- Identificação do número de telefone
- Identificação da conta do WhatsApp Business
- Dois tokens de usuário (`userToken` / token longo) da API do WhatsApp/Meta

Isso não tem relação com o conteúdo do documento (arquitetura de portais) — parece ter sido colado ali por engano.

## Escopo

1. Remover essas linhas de `PORTALS.md`.
2. **Revogar/rotacionar os tokens expostos** no painel do Meta/WhatsApp Business — texto já commitado em texto puro deve ser considerado comprometido, mesmo removendo do arquivo depois (histórico de git, se houver, ou cópias locais).
3. Se esses tokens ainda forem usados em produção, mover pra `empresa_configs` (padrão do projeto para credenciais, ver `whatsappNotify.js`) ou variável de ambiente — nunca em markdown versionado.

## Nota

Este projeto não é um repositório git (`Is a git repository: false` no ambiente atual) — mas se em algum momento virar um, ou se esse arquivo já foi compartilhado/sincronizado em outro lugar (Google Drive, backup, etc.), os tokens já devem ser tratados como vazados.
