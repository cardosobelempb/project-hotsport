# WireGuard VPN — Configuracao e Integracao wg-easy

> Documento tecnico do sistema VPN WireGuard usado para conectar MikroTiks atras de NAT ao servidor hotspot.
>
> **Criado em:** 2026-06-22
> **Migration relacionada:** N/A (configuracao de infraestrutura)

---

## 1. Objetivo

Permite que o backend do hotspot se comunique via API RouterOS com MikroTiks instalados em redes privadas (atras de NAT), sem necessidade de IP publico fixo nos roteadores. O MikroTik estabelece a conexao VPN e recebe um IP tunelado (`10.8.0.x`); o backend usa esse IP para acessar a API do MikroTik.

- Cada empresa pode ter N peers VPN, gerenciados pela tabela `empresa_vpn_peers`
- A interface de gerenciamento (`wg-easy`) roda em container Docker
- O backend se comunica com o wg-easy via API REST autenticada por sessao (cookie)

---

## 2. Arquitetura

```
[MikroTik em rede privada]
        |
        | WireGuard UDP (porta 51820 dev / 13231 prod)
        v
[Servidor / VPS]
  wg-easy container (ghcr.io/wg-easy/wg-easy:14)
        |
        | HTTP interno (porta 51821, rede Docker hotspot-net)
        v
  backend Node.js (wireguardController.js)
        |
        | RouterOS API (porta 8728, via tunnel 10.8.0.x)
        v
[MikroTik — IP VPN 10.8.0.x]
```

### Pontos importantes da arquitetura

1. O backend acessa o wg-easy pelo hostname Docker `wg-easy` (variavel `WG_EASY_HOST`), nao por `localhost`
2. O wg-easy v14 usa autenticacao por cookie de sessao (`POST /api/session` com a senha plain text — o container compara com o hash bcrypt)
3. O cookie de sessao e guardado em memoria no backend (`wgCookie`); se expirar, o `makeRequest` re-autentica automaticamente
4. Os dados de peer ficam em volume Docker persistente (`wireguard_data`) — sobrevivem a recreates

---

## 3. Variaveis de Ambiente

### Backend (`.env` / `.env.prod`)

| Variavel | Descricao | Exemplo dev | Exemplo prod |
|---|---|---|---|
| `WG_EASY_HOST` | Hostname do servico wg-easy na rede Docker | `wg-easy` | `wg-easy` |
| `WG_HOST` | IP publico ou IP local para o endpoint dos peers | `192.168.88.253` | `137.131.246.125` |
| `WG_PASS` | Senha plain text do painel wg-easy (usada pelo backend para autenticar na API) | `Java262011@` | senha forte |
| `WG_PANEL_PORT` | Porta TCP do painel wg-easy | `51821` | `51821` |
| `WG_VPN_PORT` | Porta UDP do tunel WireGuard | `51820` | `13231` |

### wg-easy container (`wg-password.env`)

| Variavel | Descricao | Como gerar |
|---|---|---|
| `PASSWORD_HASH` | Hash bcrypt da senha (deve bater com `WG_PASS`) | `node backend/scripts/generate-wg-hash.js 'SENHA'` |

> **CRITICO:** O `PASSWORD_HASH` deve estar em `wg-password.env` (nao no `.env` principal). Ver Gotcha 2.

---

## 4. Arquivos-chave

- `docker-compose.yml` — servico `wg-easy` com `env_file: wg-password.env`
- `infra/wireguard/docker-compose.yml` — compose alternativo para rodar wg-easy isolado
- `wg-password.env` — arquivo dedicado com `PASSWORD_HASH` (sem interpolacao Docker)
- `backend/src/controllers/wireguardController.js` — autenticacao, CRUD de peers, geracao do script RouterOS
- `backend/src/routes/wireguardRoutes.js` — rotas `/api/wireguard/*`
- `backend/scripts/generate-wg-hash.js` — helper para gerar bcrypt hash compativel
- `frontend/src/pages/admin/Wireguard.jsx` — UI de gerenciamento de peers VPN

---

## 5. Fluxo de Autenticacao do Backend com wg-easy

```
backend (wireguardController.js)
  -> POST http://wg-easy:51821/api/session { password: WG_PASS }
  <- 200/204 + Set-Cookie: connect.sid=...
  -> guarda cookie em `wgCookie` (variavel em memoria)

para cada requisicao subsequente:
  -> GET/POST/DELETE /api/wireguard/client
     Header: Cookie: connect.sid=...
  <- dados dos peers

se receber 401:
  -> re-autentica automaticamente (uma tentativa)
  -> repete a requisicao com novo cookie
```

---

## 6. Configuracao Docker

### docker-compose.yml (servico wg-easy)

```yaml
wg-easy:
  image: ghcr.io/wg-easy/wg-easy:14
  container_name: hotspot-wireguard
  restart: unless-stopped
  env_file:
    - wg-password.env          # PASSWORD_HASH sem interpolacao
  environment:
    - WG_HOST=${WG_HOST}
    - PORT=${WG_PANEL_PORT:-51821}
    - WG_PORT=${WG_VPN_PORT:-51820}
  volumes:
    - wireguard_data:/etc/wireguard
  cap_add:
    - NET_ADMIN
    - SYS_MODULE
  sysctls:
    - net.ipv4.ip_forward=1
    - net.ipv4.conf.all.src_valid_mark=1
  networks:
    - hotspot-net
```

### wg-password.env

```
PASSWORD_HASH=$$2a$$12$$NOi3JMyQKAF0Swv4MKHLeOcboUHY5pm9Urgzu/x6n9MGJLGheVVqG
```

> Os `$$` viram `$` literais apos processamento do Docker Compose. Ver Gotcha 2.

---

## 7. Endpoints da API

```
GET    /api/wireguard/status              # Status VPN + lista de peers da empresa
GET    /api/wireguard/settings            # WG_HOST, WG_PORT, WG_PANEL_PORT atuais
PUT    /api/wireguard/settings            # Retorna aviso (configs sao via .env)
POST   /api/wireguard/clients             # Criar peer, salva em empresa_vpn_peers
DELETE /api/wireguard/clients/:id         # Deletar peer (verifica empresa_id)
GET    /api/wireguard/clients/:id/config  # Baixar config WireGuard + script RouterOS
```

---

## 8. Gerando o Hash da Senha

O wg-easy v14 exige `PASSWORD_HASH` (bcrypt) — nao aceita `PASSWORD` (plain text).

```bash
# Usando o helper do projeto (bcryptjs)
node backend/scripts/generate-wg-hash.js 'SUA_SENHA'

# Ou usando o proprio container
docker run --rm ghcr.io/wg-easy/wg-easy:14 wgpw 'SUA_SENHA'
```

Copie o hash gerado e cole em `wg-password.env` com os `$` escapados como `$$`:

```
# hash gerado: $2a$12$abc...xyz
# no arquivo:
PASSWORD_HASH=$$2a$$12$$abc...xyz
```

Depois: `docker compose up -d --force-recreate wg-easy`

---

## 9. Configuracao por Ambiente

### Desenvolvimento (LAN local)

```env
WG_HOST=192.168.88.253    # IP local da maquina de dev
WG_VPN_PORT=51820
```

MikroTik na mesma rede conecta diretamente ao IP local. Porta 51820 UDP deve estar liberada no firewall do Windows:

```powershell
# PowerShell como Administrador
netsh advfirewall firewall add rule name="WireGuard UDP 51820" dir=in action=allow protocol=UDP localport=51820
```

### Producao (VPS)

```env
WG_HOST=137.131.246.125   # IP publico da VPS
WG_VPN_PORT=13231         # porta diferente pra evitar conflito
```

```bash
# Liberar porta no UFW
ufw allow 13231/udp
ufw reload
```

---

## 10. Instalando o Peer no MikroTik

1. No painel admin `/admin/:slug/vpn`, clicar em **+ New** para criar o peer
2. Clicar em **Config** (ícone de download) para baixar o script RouterOS
3. No terminal do MikroTik, colar e executar o script:

```
/interface wireguard add listen-port=13231 mtu=1420 name=wg-hotspot private-key="..."
/interface wireguard peers add allowed-address=10.8.0.0/24 endpoint-address=<WG_HOST> endpoint-port=<WG_VPN_PORT> interface=wg-hotspot public-key="..." persistent-keepalive=25s
/ip address add address=10.8.0.x/24 interface=wg-hotspot
```

4. Apos conexao, o peer aparece com handshake recente no painel
5. Registrar o IP VPN (`10.8.0.x`) no campo `vpn_ip` do MikroTik no sistema

---

## 11. Gotchas

### Gotcha 1: wg-easy v14 rejeita `PASSWORD` — obrigatorio usar `PASSWORD_HASH`

**Erro:** `Error: DO NOT USE PASSWORD ENVIRONMENT VARIABLE. USE PASSWORD_HASH INSTEAD.`

**Causa:** v14 foi reescrito em TypeScript e removeu suporte a `PASSWORD` plain text. A variavel agora se chama `PASSWORD_HASH` e deve conter um hash bcrypt.

**Fix:** Remover `PASSWORD` do `environment` no docker-compose; usar apenas `PASSWORD_HASH` via `env_file`.

**Como reproduzir:** Adicionar `PASSWORD: qualquer_coisa` no environment do servico wg-easy com imagem v14.

---

### Gotcha 2: Docker Compose v2 interpola `$VAR` dentro de valores de `.env` e `env_file` — hash bcrypt fica corrompido

**Erro:** 401 Unauthorized mesmo com hash "correto". `docker exec hotspot-wireguard env | grep PASSWORD_HASH` mostra hash truncado (`$2a$12/x6n9MGJLGheVVqG` em vez de `$2a$12$NOi3...`).

**Causa:** O Docker Compose v2 trata `$NOME` como referencia de variavel em TODOS os arquivos que le (`.env`, `env_file`). O fragmento `$NOi3JMyQKAF0Swv4MKHLeOcboUHY5pm9Urgzu` dentro do hash bcrypt e um nome de variavel valido (comeca com letra, contem apenas alfanumericos) — e substituido por string vazia, corrompendo o hash.

**Fix:** Escapar todos os `$` no hash com `$$` no arquivo fonte:
```
# Correto:
PASSWORD_HASH=$$2a$$12$$NOi3JMyQKAF0Swv4MKHLeOcboUHY5pm9Urgzu/x6n9MGJLGheVVqG
# O Docker converte $$ -> $ ao passar pro container
```

**Como reproduzir:** Colocar qualquer hash bcrypt sem escapar `$` e verificar com `docker exec ... env | grep PASSWORD_HASH`.

---

### Gotcha 3: wg-easy v15 nao aceita as variaveis de ambiente do v14

**Erro:** `Error: You are using an invalid Configuration for wg-easy. Please follow the instructions on https://wg-easy.github.io/wg-easy/latest/advanced/migrate/from-14-to-15/`

**Causa:** v15 e uma reescrita com Nitro/Nuxt e mudou completamente o formato de configuracao.

**Fix:** Pinar em `:14` — e a versao mais recente que funciona com as variaveis atuais e a API de sessao usada pelo controller.

**Como reproduzir:** Trocar a imagem para `ghcr.io/wg-easy/wg-easy:15` e subir o container.

---

### Gotcha 4: `WG_HOST=localhost` gera config de peer inutilizavel

**Causa:** O `WG_HOST` e usado para preencher o campo `Endpoint` no arquivo de configuracao do peer WireGuard. Com `localhost`, o MikroTik tentaria conectar em si mesmo.

**Fix:**
- Dev com MikroTik na mesma LAN: usar IP local da maquina (`192.168.88.253`)
- Dev com MikroTik remoto: usar IP publico + port forwarding no roteador
- Producao: usar IP publico da VPS

**Impacto:** Peers criados com `WG_HOST` errado precisam ser deletados e recriados — o endpoint fica gravado no arquivo de configuracao gerado no momento do download.

---

### Gotcha 5: `PASSWORD_HASH: ${WG_PASS_HASH}` no docker-compose sofre dupla interpolacao

**Causa:** Docker Compose faz uma passagem de interpolacao no YAML (`${WG_PASS_HASH}` -> valor do `.env`). Depois, ao processar o valor resultante que contem `$`, faz outra passagem. Resultado: mesmo com `env_file`, o hash fica corrompido se o valor vier via `${VAR}` no YAML.

**Fix:** Usar o `env_file` dedicado (`wg-password.env`) com os `$$` escapados, e remover `PASSWORD_HASH` do bloco `environment` do docker-compose.

---

### Gotcha 6: Firewall de nuvem do provedor bloqueia a porta mesmo com Docker/iptables corretos (confirmado: Oracle Cloud)

**Sintoma:** peer nunca recebe handshake. `docker port <container>` mostra `51820/udp` (e as portas RADIUS `1812`/`1813`/`3799`) publicadas corretamente. `iptables -L DOCKER -n` mostra `ACCEPT` e `iptables -t nat -L DOCKER -n` mostra `DNAT` certo pro IP interno do container. Mesmo assim, nenhum pacote chega.

**Causa:** provedores de nuvem (Oracle Cloud, AWS, GCP, Azure, etc.) tem uma camada de firewall **fora da VM**, gerenciada pelo console web — Security Lists / Network Security Groups na Oracle Cloud, Security Groups na AWS, etc. — completamente independente do `iptables`/`ufw` rodando dentro do sistema operacional. Abrir a porta no SO nao abre a porta na nuvem. Em VPS provisionadas via Coolify pode nem existir `ufw` instalado — o Docker gerencia suas proprias regras de `iptables` automaticamente ao publicar portas com `-p`, entao o SO ja fica correto sem nenhuma acao manual, o que engana o diagnostico (tudo parece certo "por dentro").

**Fix (Oracle Cloud):** Console OCI → **Networking → Virtual Cloud Networks → [sua VCN] → Security Lists** (ou **Network Security Groups**, se a instancia usar NSG em vez de Security List — confirmar em **Instance Details → Attached VNICs → sua VNIC**) → **Ingress Rules → Add Ingress Rules**, uma regra UDP por porta usada:

| Source CIDR | Protocolo | Porta destino | Uso |
|---|---|---|---|
| `0.0.0.0/0` | UDP | `51820` | Tunel WireGuard |
| `0.0.0.0/0` | UDP | `1812` | RADIUS Auth |
| `0.0.0.0/0` | UDP | `1813` | RADIUS Accounting |
| `0.0.0.0/0` | UDP | `3799` | RADIUS CoA/Disconnect |

Em outros provedores, procurar o equivalente (Security Group na AWS, Cloud Armor/firewall rules na GCP, NSG no Azure).

**Diagnostico que isola o problema (rodar antes de mexer em qualquer coisa):**
```bash
docker ps -a | grep wg                  # acha o nome real do container (Coolify usa UUID no nome, nao "hotspot-wireguard")
docker port <container>                 # confirma se a porta esta publicada
iptables -L DOCKER -n | grep udp        # confirma ACCEPT no SO
tcpdump -ni any udp port 51820          # escuta em tempo real enquanto o peer tenta conectar
```
Se os tres primeiros comandos estiverem OK e mesmo assim **nenhum pacote aparecer no tcpdump** enquanto o MikroTik tenta conectar, o bloqueio esta antes de chegar na VM — firewall de nuvem, nao adianta mexer em mais nada dentro do servidor.

**Como reproduzir:** criar instancia nova na Oracle Cloud, subir o stack via Coolify, confirmar Docker publicando a porta e `iptables -L DOCKER -n` com ACCEPT — sem tocar no Security List, o handshake WireGuard nunca completa.

---

## 12. Troubleshooting

| Sintoma | Causa provavel | Fix |
|---|---|---|
| `401 Unauthorized` no painel admin VPN | Hash corrompido ou nao batendo com `WG_PASS` | `docker exec hotspot-wireguard env \| grep PASSWORD_HASH` — verificar se hash esta completo (60 chars); recriar com hash correto |
| `DO NOT USE PASSWORD ENVIRONMENT VARIABLE` | `PASSWORD` no environment do docker-compose com imagem v14 | Remover `PASSWORD` do environment, usar apenas `env_file` com `PASSWORD_HASH` |
| `You are using an invalid Configuration` | Imagem v15 pinada | Trocar para `:14` |
| Peer criado mas sem handshake | WG_HOST errado ou porta UDP bloqueada | Verificar `WG_HOST` no container; abrir porta UDP no firewall/roteador; recriar peer |
| MikroTik conecta mas nao aparece online no painel | Peer criado quando `WG_HOST=localhost` | Deletar peer, atualizar `WG_HOST`, recriar peer, baixar novo config |
| Hash aparece truncado no container | `$` nao escapados com `$$` | Atualizar `wg-password.env` com `$$` e `--force-recreate` |
| Backend nao alcanca wg-easy | `WG_EASY_HOST` errado (ex: `localhost` em vez de `wg-easy`) | Verificar variavel; em Docker usa `wg-easy`; fora do Docker usa `localhost` |
| Peer nunca recebe handshake, mas `docker port` e `iptables -L DOCKER -n` mostram tudo publicado/ACCEPT corretamente | Firewall de nuvem do provedor (Security List/NSG na Oracle Cloud, Security Group na AWS, etc.) bloqueando por fora da VM | Abrir Ingress Rules pra porta UDP no console do provedor (ver Gotcha 6); `tcpdump -ni any udp port <porta>` no servidor confirma se o pacote chega |

**Query util para debug de peers:**
```sql
SELECT e.nome empresa, p.nome peer_name, p.wg_client_id
FROM empresa_vpn_peers p
JOIN empresas e ON e.id = p.empresa_id
ORDER BY e.id;
```

---

## 13. Onde mexer se...

| Situacao | Arquivo |
|---|---|
| Mudar versao do wg-easy | `docker-compose.yml` e `infra/wireguard/docker-compose.yml` linha `image:` |
| Trocar senha do wg-easy | `wg-password.env` (hash com `$$`) + `WG_PASS` no `.env` |
| Alterar porta VPN | `WG_VPN_PORT` no `.env` + regra de firewall/UFW |
| Alterar IP publico (WG_HOST) | `WG_HOST` no `.env` + deletar/recriar peers (config ja baixada fica com o IP antigo) |
| Ajustar script RouterOS gerado | `wireguardController.js` funcao `getClientConfig` |
| Adicionar campo na tabela de peers | `backend/migrations/005_vpn_peers.js` + `wireguardController.js` |
| Mudar autenticacao com wg-easy | `wireguardController.js` funcao `authenticate` |

---

## 14. Limitacoes conhecidas

- Nao ha health check automatico do container wg-easy — se cair, os peers ficam offline silenciosamente
- O cookie de sessao e guardado em variavel em memoria; se o backend reiniciar, precisa re-autenticar (acontece automaticamente na proxima requisicao)
- wg-easy v14 nao tem suporte a Home Assistant (anunciado para versoes futuras)
- Peers criados com `WG_HOST` errado nao tem como ser "atualizados" — precisam ser deletados e recriados
- Nao ha monitoramento de handshake — o sistema nao alerta se um MikroTik perder a conexao VPN
- `docker compose config` mostra `$$` como `$$$$` (artefato visual) mas o valor no container e correto

---

## 15. Changelog

### 2026-07-14
- Documentado Gotcha 6: firewall de nuvem (confirmado em producao na Oracle Cloud) bloqueia portas UDP mesmo com Docker/iptables do SO configurados corretamente — precisa liberar Ingress Rules no Security List/NSG do provedor, camada totalmente separada do firewall do SO
- Adicionada linha na tabela de Troubleshooting e roteiro de diagnostico (`docker ps -a | grep wg`, `docker port`, `iptables -L DOCKER -n`, `tcpdump`) pra isolar bloqueio de nuvem de bloqueio de config
- Registrado que ambientes Coolify (`docker-compose.coolify.yml`) usam nome de container dinamico (sufixo com UUID do recurso) em vez do `hotspot-wireguard` fixo do compose antigo — usar `docker ps -a | grep wg` pra localizar

### 2026-06-22
- Pinada versao do wg-easy em `:14` (v13 nao suporta `PASSWORD_HASH`; v15 exige migracao)
- Removida variavel `PASSWORD` do docker-compose (rejeitada pelo v14)
- Criado `wg-password.env` dedicado para `PASSWORD_HASH` com `$$` escapados (fix do Gotcha 2)
- Adicionado `env_file: wg-password.env` no servico wg-easy do docker-compose
- Criado `backend/scripts/generate-wg-hash.js` — helper para gerar hash bcrypt
- Adicionado logging de debug na funcao `authenticate` do `wireguardController.js`
- Variaveis `WG_PASS_HASH` renomeadas para `PASSWORD_HASH` nos arquivos `.env` e `.env.dev`
- Documentado comportamento de interpolacao do Docker Compose v2 com hashes bcrypt
