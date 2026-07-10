# Deploy no Coolify

Ambiente **novo e separado** do stack Traefik/Portainer que ja roda em producao
(`docker-compose.prod.yml` + `.env.prod`, dominio `hotspot.surb.com.br`). Este
guia usa `docker-compose.coolify.yml`, que nao sobe MySQL/PostgreSQL/Evolution
— aponta para instancias externas ja existentes, igual ao stack atual.

## Pre-requisitos

1. **Repositorio git.** O Coolify clona o projeto via git a cada deploy — o
   diretorio local precisa estar num repositorio (GitHub/GitLab/Bitbucket ou
   git self-hosted) que o Coolify consiga acessar (repo publico, ou privado
   com deploy key configurada na UI do Coolify).
2. **VPS com Coolify instalado**, com o modulo de kernel WireGuard disponivel
   (`modprobe wireguard` funcionando) — os containers `wg-easy`/`freeradius`
   precisam de `NET_ADMIN`/`SYS_MODULE`, ja declarados no compose.
3. **MySQL e (opcionalmente) Evolution API externos**, acessiveis a partir da
   VPS do Coolify (rede/firewall liberado do lado do banco).
4. Hash bcrypt da senha do painel wg-easy:
   ```bash
   docker run --rm ghcr.io/wg-easy/wg-easy wgpw 'SUA_SENHA'
   ```

## Passo a passo

### 1. Criar o recurso no Coolify

- **New Resource → Docker Compose** (ou "Application" com source type
  Docker Compose, dependendo da versao).
- Conectar ao repositorio git do projeto.
- **Docker Compose Location**: `docker-compose.coolify.yml`.

### 2. Variaveis de ambiente

Copiar as chaves de [`.env.coolify.example`](../.env.coolify.example) para a
aba "Environment Variables" do recurso no Coolify, preenchendo com os valores
reais (banco externo, Evolution externa, WireGuard). Nunca commitar esses
valores — o `.gitignore` ja bloqueia `.env.coolify`, `.env`, `.env.dev`,
`.env.prod` e `wg-password.env`.

### 3. Dominio por servico

O compose **nao tem labels Traefik** — o Coolify gera o roteamento sozinho a
partir do dominio (FQDN) configurado por servico na UI:

| Servico    | Dominio a configurar                                               | Motivo                                                                |
| ---------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `frontend` | `https://hotspot.seudominio.com.br` (raiz)                         | SPA React, serve tudo que nao bater nos paths do backend              |
| `backend`  | mesmo dominio + paths `/api`, `/uploads`, `/hotspot`, `/emergency` | API, uploads publicos, redirect do captive portal, tela de emergencia |

Se a versao do Coolify nao suportar path no campo de dominio do servico,
usar a aba de "Routing/Labels" avancada do recurso pra adicionar uma regra
`PathPrefix` equivalente apontando pro servico `backend` porta `3001`, com
prioridade maior que a rota do `frontend`.

`wg-easy` (porta 51950) e as portas RADIUS/WireGuard **nao** devem receber
dominio — sao publicadas direto no host (ver secao seguinte).

### 4. Firewall da VPS (fora do proxy do Coolify)

O proxy do Coolify so cobre HTTP(S) 80/443. Estas portas precisam estar
liberadas manualmente no firewall da VPS (ex: `ufw allow`):

| Porta                            | Protocolo | Uso                                                    |
| -------------------------------- | --------- | ------------------------------------------------------ |
| `WG_VPN_PORT` (padrao 51820)     | UDP       | Tunel WireGuard (MikroTiks atras de NAT)               |
| `WG_PANEL_PORT` (padrao 51950)   | TCP       | Painel wg-easy (acessado direto por IP:porta, sem TLS) |
| `RADIUS_AUTH_PORT` (padrao 1812) | UDP       | Autenticacao RADIUS                                    |
| `RADIUS_ACCT_PORT` (padrao 1813) | UDP       | Accounting RADIUS                                      |
| `RADIUS_COA_PORT` (padrao 3799)  | UDP       | CoA/Disconnect RADIUS                                  |

Os MikroTiks usam `WG_HOST` (IP publico da VPS) como endpoint do peer
WireGuard e como destino dos pacotes RADIUS — nao passam pelo dominio HTTP.

### 5. Deploy

Disparar o deploy pela UI do Coolify. O backend roda as migrations
pendentes automaticamente no boot (`scripts/runMigrations.js`, ja no `CMD`
do `docker/backend/Dockerfile`) — nao precisa rodar nada manualmente.

### 6. Verificacao pos-deploy

- `https://SEUDOMINIO/api/health` deve responder `{"status":"ok"}` (novo
  endpoint, tambem usado pelo `HEALTHCHECK` do container).
- Login do painel admin (`https://SEUDOMINIO/`).
- Painel wg-easy em `http://WG_HOST:WG_PANEL_PORT` com a senha de `WG_PASS`.
  Se o login falhar, o problema quase certo e a variavel `WG_PASS_HASH`
  cadastrada no Coolify sem os `$` dobrados — ver `.env.coolify.example`.
  Sintoma no log de build/deploy: `The "XXXX" variable is not set. Defaulting
  to a blank string.` com `XXXX` sendo um pedaco do meio do hash bcrypt.

## Troubleshooting

### Build falha com `resolve : lstat .../docker: no such file or directory`

O Coolify nao encontrou a pasta `docker/` (onde ficam os Dockerfiles) dentro
do checkout do repositorio, mesmo ela estando commitada. Quase sempre e' o
campo **"Base Directory"** do recurso no Coolify apontando pra um
subdiretorio em vez da raiz do repo. Como `docker-compose.coolify.yml` e as
pastas `docker/`, `backend/`, `frontend/` ficam todas na raiz do projeto:

- Base Directory: `/` (raiz)
- Docker Compose Location: `docker-compose.coolify.yml`

Se o valor ja estiver `/` e o erro persistir, force um novo clone completo
(opcao "Force rebuild" / limpar cache de build do recurso no Coolify) — as
vezes o checkout anterior ficou incompleto de uma tentativa que falhou antes
do `docker/` existir no repo.

### `The "XXXX" variable is not set. Defaulting to a blank string.` no log de build

Alguma variavel cadastrada no Coolify tem um `$` literal no valor (tipicamente
`WG_PASS_HASH`, o hash bcrypt do wg-easy) sem estar escapado como `$$`. O
Compose le `$X` dentro do valor como inicio de outra variavel. Corrigir
dobrando cada `$` no valor cadastrado na UI do Coolify (ver
`.env.coolify.example`).

## Diferencas para o stack Portainer/Swarm existente

|                 | `docker-compose.prod.yml` (atual)                                  | `docker-compose.coolify.yml` (novo)                       |
| --------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| Orquestrador    | Docker Swarm via Portainer                                         | `docker compose` puro (Coolify)                           |
| Proxy           | Traefik externo, labels manuais                                    | Proxy do Coolify, dominio via UI                          |
| Rede do proxy   | `traefik-public` externa                                           | Gerenciada pelo Coolify                                   |
| Hash wg-easy    | `env_file: wg-password.env` com `$$` escapado no arquivo | `environment: PASSWORD_HASH: ${WG_PASS_HASH}` com `$$` escapado no valor da variavel (Coolify UI) |
| Banco/Evolution | Externos                                                           | Externos (igual)                                          |

O codigo do backend/frontend e identico nos dois — so muda a orquestracao.

```mysql
mysql -u root -p
CREATE DATABASE hotspot;
USE nome_do_banco;
```
