# Deploy no Coolify

Ambiente **novo e separado** do stack Traefik/Portainer que ja roda em producao
(`docker-compose.prod.yml` + `.env.prod`, dominio `hotspot.surb.com.br`). Este
guia usa `docker-compose.coolify.yml`, que sobe o proprio MySQL dentro do
compose (self-contained, sem depender de recurso Database separado no
Coolify) — so a Evolution API (WhatsApp) continua externa, opcional.

## Pre-requisitos

1. **Repositorio git.** O Coolify clona o projeto via git a cada deploy — o
   diretorio local precisa estar num repositorio (GitHub/GitLab/Bitbucket ou
   git self-hosted) que o Coolify consiga acessar (repo publico, ou privado
   com deploy key configurada na UI do Coolify).
2. **VPS com Coolify instalado**, com o modulo de kernel WireGuard disponivel
   (`modprobe wireguard` funcionando) — os containers `wg-easy`/`freeradius`
   precisam de `NET_ADMIN`/`SYS_MODULE`, ja declarados no compose.
3. **Evolution API externa (opcional)**, acessivel a partir da VPS do Coolify
   se for usar notificacao WhatsApp. O MySQL sobe junto, nao precisa de nada
   externo pra ele.
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
reais (credenciais do MySQL que vai subir junto, Evolution externa se usar,
WireGuard). Nunca commitar esses valores — o `.gitignore` ja bloqueia
`.env.coolify`, `.env`, `.env.dev`, `.env.prod` e `wg-password.env`.

### 3. Dominio por servico

- **`frontend`**: configurar o dominio raiz na UI do Coolify normalmente
  (`https://hotspot.seudominio.com.br`) — usa o roteamento automatico do
  Coolify, sem nenhum label manual.
- **`backend`**: **NAO** usar o campo de dominio/paths da UI pra esse
  servico. O compose ja vem com labels Traefik manuais fixas (`PathPrefix`
  pra `/api`, `/uploads`, `/hotspot`, `/emergency`, prioridade 100, porta
  3001) porque o recurso "multiplos paths" da UI do Coolify gera um
  middleware `stripprefix` que remove o prefixo antes de encaminhar — o
  backend registra as rotas COM o prefixo (`app.use('/api/...')`), entao
  o strip fazia tudo cair em 404. Se o campo `docker_compose_domains` do
  recurso ja tiver uma entrada `"backend"` (de uma tentativa anterior pela
  UI), remova-a pra nao gerar routers duplicados/conflitantes — via UI ou
  direto no banco do Coolify (ver Troubleshooting).

`SYSTEM_DOMAIN` (variavel de ambiente do recurso) precisa bater com o
dominio real usado, pois o label do backend usa `Host(\`${SYSTEM_DOMAIN}\`)`.

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

> **Atencao (confirmado em producao na Oracle Cloud, 2026-07-14):** alem do
> firewall do proprio SO, provedores de nuvem tem uma camada extra **fora da
> VM** (Security Lists / Network Security Groups na Oracle Cloud; Security
> Groups na AWS; etc.) que bloqueia por padrao qualquer porta UDP
> customizada — mesmo com o Docker publicando a porta corretamente e o
> `iptables` do SO com as regras certas. Muitas VPS provisionadas via
> Coolify nem tem `ufw` instalado (`ufw allow` acima e' so um exemplo
> generico, nao um requisito) — o Docker gerencia suas proprias regras de
> `iptables` automaticamente ao publicar portas com `-p`, entao o SO
> normalmente ja fica correto sozinho. Pra confirmar rapido onde esta o
> bloqueio:
> ```bash
> docker ps -a | grep wg              # acha o nome real do container (Coolify usa UUID no nome)
> docker port <container>             # confirma se a porta esta publicada
> iptables -L DOCKER -n | grep udp    # confirma ACCEPT/DNAT no SO
> ```
> Se os tres passos acima estiverem OK e o peer ainda nao conectar, o
> bloqueio esta no firewall de nuvem do provedor. Na Oracle Cloud: **Networking
> → Virtual Cloud Networks → [sua VCN] → Security Lists (ou Network Security
> Groups) → Ingress Rules → Add Ingress Rules**, uma regra UDP por porta
> (Source `0.0.0.0/0`). Roteiro completo de diagnostico: Gotcha 6 em
> `docs/WIREGUARD-VPN.md`.

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

### Build falha com `exec /bin/sh: exec format error` (exit code 255)

Incompatibilidade de arquitetura de CPU: a imagem base foi publicada so pra
uma plataforma (ex: `amd64`) e a VPS e' de outra (ex: `aarch64`/ARM). Nenhum
binario daquela imagem consegue rodar, entao **qualquer** `RUN` falha com
esse erro, nao importa o comando - o log pode nem mostrar essa mensagem
claramente se vier truncado, aparecendo so como `exit code: 255` generico.
Checar a arquitetura da VPS (`uname -m`) e da imagem
(`docker manifest inspect --verbose <imagem> | grep architecture`) antes de
gastar tempo debugando o comando em si. O `docker/freeradius/Dockerfile`
deste projeto ja foi corrigido nesse sentido (trocado de
`freeradius/freeradius-server:latest`, amd64-only, para `debian:bookworm-slim`
+ pacote `freeradius` nativo, multi-arch).

### `[migrate] MySQL ainda indisponivel: EAI_AGAIN` no boot do backend

`EAI_AGAIN` e' falha de resolucao de DNS - o container do backend nao
consegue resolver o hostname de `DB_HOST`. Isso acontece se o backend e o
MySQL nao estiverem na mesma rede Docker (cada recurso do Coolify normalmente
ganha rede propria isolada). Este `docker-compose.coolify.yml` ja evita esse
problema subindo o MySQL como servico `mysql` dentro do proprio compose, na
mesma rede `hotspot-internal` do backend - `DB_HOST` fica fixo em `mysql`,
nao e' mais variavel de ambiente. So acontece de novo se alguem apontar
`DB_HOST` pra um banco fora deste compose sem ajustar a rede.

### `POST /api/...` retorna 404, mas o dominio abre normal (GET funciona)

O backend esta configurado com labels manuais (ver secao "Dominio por
servico" acima) exatamente pra evitar isso. Se aparecer mesmo assim, o
recurso "multiplos paths" da UI do Coolify pro servico `backend` foi usado
em algum momento e ficou uma entrada residual em `docker_compose_domains`
gerando um router com middleware `stripprefix` que compete com o nosso.
Verificar e remover:

```bash
docker exec coolify-db psql -U coolify -d coolify -c \
  "SELECT docker_compose_domains FROM applications WHERE uuid = '<uuid-do-recurso>';"
```

Se aparecer uma chave `"backend"` nesse JSON, remover (deixando so
`"frontend"`) e redeploy:

```bash
docker exec -i coolify-db psql -U coolify -d coolify <<'EOF'
UPDATE applications
SET docker_compose_domains = '{"frontend":{"domain":"https:\/\/SEUDOMINIO\/"}}'
WHERE uuid = '<uuid-do-recurso>';
EOF
```

### `POST /api/...` da Gateway Timeout (ou fica pendurado sem responder), mas `GET /` (frontend) funciona

Duas causas possiveis, nessa ordem de probabilidade:

**1. Label `traefik.docker.network` apontando pra rede errada.** Cada
recurso "Docker Compose" do Coolify ganha uma rede implicita propria,
nomeada com a UUID do recurso (ex: `a18a0r06eapf4tf6n3xk4ehz` - aparece no
nome de cada container, tipo `backend-a18a0r06eapf4tf6n3xk4ehz-<ts>`). E'
NESSA rede que o proxy consegue alcancar os containers - a rede literal
`coolify` e' so do painel/infra do Coolify em si, os containers do seu
projeto normalmente NAO estao nela. Se o label `traefik.docker.network`
apontar pra rede errada, o Traefik encontra o router (TLS fecha normal,
certificado bate) mas nunca acha um servidor valido pro service - fica
pendurado sem responder e **sem logar nenhum erro**, o que torna esse
sintoma dificil de distinguir de um problema de rede real. Diagnostico
definitivo - comparar as duas redes do container:

```bash
docker inspect <nome-do-backend> --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}: {{$v.IPAddress}}{{println}}{{end}}'
# testa cada IP que aparecer, de dentro do proxy:
docker exec coolify-proxy wget -qO- --timeout=5 http://<IP>:3001/api/health
```

O IP que responder `{"status":"ok"}` esta na rede certa - usar o NOME
dessa rede (a UUID do projeto) no label `traefik.docker.network` do
`docker-compose.coolify.yml`, nao `coolify`. Esse valor muda por recurso/
projeto, entao se este compose for reusado em outro deploy, atualizar a
UUID (e o dominio hardcoded na regra do router, mesma secao) manualmente.

**2. Traefik perdeu a conexao com o Docker.** O proprio `coolify-proxy`
parou de conseguir listar os containers e ficou com config desatualizada.
Confirmar no log:

```bash
docker logs coolify-proxy --tail 20 | grep -i "context canceled\|failed to list"
```

Se aparecer `Failed to list containers for docker: context canceled` (ou
similar) **com timestamp recente** (cuidado: `docker logs --tail N` pode
mostrar historico de dias atras se nao tiver log novo - conferir a data/
hora antes de agir), reiniciar o proxy resolve (ele reconecta no socket
do Docker e recarrega tudo):

```bash
docker restart coolify-proxy
```

### MikroTik nunca conecta na VPN/RADIUS, mesmo com as portas publicadas certinho no Docker

Firewall de nuvem do provedor bloqueando por fora da VM (testado e confirmado
na Oracle Cloud — Security List sem as Ingress Rules das portas UDP). Ver
secao "4. Firewall da VPS" acima e Gotcha 6 em `docs/WIREGUARD-VPN.md` para
o roteiro completo de diagnostico (`docker port`, `iptables -L DOCKER -n`,
`tcpdump`).

## Diferencas para o stack Portainer/Swarm existente

|                 | `docker-compose.prod.yml` (atual)                                  | `docker-compose.coolify.yml` (novo)                       |
| --------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| Orquestrador    | Docker Swarm via Portainer                                         | `docker compose` puro (Coolify)                           |
| Proxy           | Traefik externo, labels manuais                                    | Proxy do Coolify, dominio via UI                          |
| Rede do proxy   | `traefik-public` externa                                           | Gerenciada pelo Coolify                                   |
| Hash wg-easy    | `env_file: wg-password.env` com `$$` escapado no arquivo | `environment: PASSWORD_HASH: ${WG_PASS_HASH}` com `$$` escapado no valor da variavel (Coolify UI) |
| Banco           | Externo (aponta pra MySQL ja existente via `DB_HOST`)     | Sobe junto no compose (servico `mysql`)                   |
| Evolution       | Externa                                                            | Externa (igual, opcional)                                  |

O codigo do backend/frontend e identico nos dois — so muda a orquestracao.
