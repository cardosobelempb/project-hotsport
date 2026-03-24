# 📡 FreeRADIUS — Integração com MikroTik e Hotspot

## Visão Geral

O FreeRADIUS atua como servidor central de **AAA** (Authentication, Authorization, Accounting) para todos os MikroTiks do projeto. A comunicação ocorre via **VPN** (WireGuard recomendado), mantendo as portas RADIUS fora da internet pública.

```
[Cliente Hotspot]
      │ conecta ao hotspot
      ▼
[MikroTik (NAS)]
      │ Access-Request (porta 1812 via VPN)
      ▼
[FreeRADIUS — servidor central]
      │ consulta credenciais
      ▼
[PostgreSQL — schema radius]
      │ Access-Accept / Access-Reject
      ▼
[MikroTik aplica atributos de sessão]
      │ Accounting-Start / Interim / Stop (porta 1813 via VPN)
      ▼
[radacct — log de sessão]
```

---

## Fluxo de Autenticação (Hotspot)

### 1. Usuário acessa o portal captive

- O MikroTik intercepta o tráfego e redireciona para o portal web.
- O portal coleta **CPF ou telefone** (e exibe aceite LGPD).

### 2. Backend valida e gera credencial

- O backend verifica se o CPF/telefone é válido e se há pagamento/voucher ativo.
- Se válido, cria (ou atualiza) as entradas RADIUS para o usuário:
  - `radcheck`: senha/credencial de acesso
  - `radreply`: atributos de sessão (velocidade, expiração, etc.)

### 3. MikroTik autentica via RADIUS

- O MikroTik envia `Access-Request` com `User-Name` e `User-Password` para o FreeRADIUS.
- O FreeRADIUS responde `Access-Accept` (com atributos) ou `Access-Reject`.

### 4. Accounting

- Ao conectar (`Start`), ao longo da sessão (`Interim-Update`) e ao desconectar (`Stop`), o MikroTik envia pacotes de accounting para a porta 1813.
- O FreeRADIUS persiste esses dados em `radacct`, permitindo relatórios de tempo e tráfego.

---

## Integração Voucher / Portal (CPF ou telefone)

### Modelo recomendado: Backend como fonte da verdade

O voucher é gerenciado no app (Prisma/PostgreSQL schema `public`) e o FreeRADIUS é usado apenas como executor de AAA.

```
[Pagamento confirmado]
        │
        ▼
[Backend cria/atualiza voucher em public.vouchers]
        │
        ▼
[Backend provisiona em radius.radcheck + radius.radreply]
        │
        ▼
[MikroTik autentica via RADIUS]
```

**Vantagens:**
- Fonte da verdade centralizada no app (auditoria, expiração, status)
- FreeRADIUS só executa — não gerencia planos ou pagamentos
- Fácil revogação: basta remover/desativar em `radcheck`

---

## Principais Tabelas do Schema `radius`

> Estas tabelas **não são gerenciadas pelo Prisma**. Devem ser criadas com o schema oficial do FreeRADIUS para PostgreSQL (`raddb/mods-config/sql/main/postgresql/schema.sql`).

### `radcheck`

Credenciais e restrições de autenticação por usuário.

| Coluna     | Tipo          | Descrição                                      |
| ---------- | ------------- | ---------------------------------------------- |
| `id`       | bigserial PK  | Identificador interno                          |
| `username` | varchar(64)   | Nome de usuário (CPF, telefone, voucher, etc.) |
| `attribute`| varchar(64)   | Atributo RADIUS (ex: `Cleartext-Password`)     |
| `op`       | char(2)       | Operador (ex: `:=`, `==`)                      |
| `value`    | varchar(253)  | Valor do atributo                              |

### `radreply`

Atributos enviados ao NAS (MikroTik) após autenticação aceita.

| Coluna     | Tipo          | Descrição                                         |
| ---------- | ------------- | ------------------------------------------------- |
| `id`       | bigserial PK  | Identificador interno                             |
| `username` | varchar(64)   | Nome de usuário                                   |
| `attribute`| varchar(64)   | Atributo RADIUS (ex: `Mikrotik-Rate-Limit`)       |
| `op`       | char(2)       | Operador (ex: `=`)                                |
| `value`    | varchar(253)  | Valor (ex: `10M/10M` para 10 Mbps down/up)        |

### `radusergroup`

Associação de usuário a um grupo (permite políticas compartilhadas por plano).

| Coluna      | Tipo        | Descrição                        |
| ----------- | ----------- | -------------------------------- |
| `username`  | varchar(64) | Nome de usuário                  |
| `groupname` | varchar(64) | Nome do grupo (ex: `plano-10mb`) |
| `priority`  | int         | Prioridade de avaliação          |

### `radgroupcheck` / `radgroupreply`

Verificações e atributos de resposta definidos **por grupo** (aplicados a todos os usuários do grupo).

### `radacct`

Registro de sessões — contabilização de tempo e tráfego.

| Coluna             | Tipo           | Descrição                                 |
| ------------------ | -------------- | ----------------------------------------- |
| `radacctid`        | bigserial PK   | ID da sessão                              |
| `acctsessionid`    | varchar(64)    | ID da sessão fornecido pelo NAS           |
| `username`         | varchar(64)    | Nome de usuário                           |
| `nasipaddress`     | inet           | IP do NAS (MikroTik)                      |
| `acctstarttime`    | timestamptz    | Início da sessão                          |
| `acctstoptime`     | timestamptz    | Fim da sessão                             |
| `acctsessiontime`  | bigint         | Duração total em segundos                 |
| `acctinputoctets`  | bigint         | Bytes recebidos pelo usuário (download)   |
| `acctoutputoctets` | bigint         | Bytes enviados pelo usuário (upload)      |
| `framedipaddress`  | inet           | IP atribuído ao usuário                   |
| `callingstationid` | varchar(50)    | MAC address do cliente                    |

### `radpostauth`

Log de todas as tentativas de autenticação (aceitas e rejeitadas).

| Coluna      | Tipo        | Descrição                              |
| ----------- | ----------- | -------------------------------------- |
| `id`        | bigserial PK | Identificador interno                 |
| `username`  | varchar(64) | Usuário que tentou autenticar          |
| `pass`      | varchar(64) | Senha usada — **desabilitar log em produção** (ver abaixo) |
| `reply`     | varchar(32) | Resultado (`Access-Accept`, `Access-Reject`) |
| `authdate`  | timestamptz | Data/hora da tentativa                 |

#### ⚠️ Desabilitar log de senha em produção

Por padrão, o FreeRADIUS pode gravar a senha em `radpostauth.pass`. Para desabilitar em produção, edite `sites-available/default` (seção `post-auth`):

```
post-auth {
  # Substitui a senha por "REDACTED" antes de gravar no banco
  -sql
  if (updated) {
    update reply {
      &reply:Reply-Message += "Auth logged"
    }
  }
  sql
}
```

Ou use o módulo `pap` com `auto_header = no` e configure o `radpostauth` para não gravar o campo `pass` (substitua por campo vazio ou hash).

---

### `nas`

Clientes RADIUS registrados (cada MikroTik é um NAS).

| Coluna        | Tipo         | Descrição                                   |
| ------------- | ------------ | ------------------------------------------- |
| `id`          | serial PK    | Identificador interno                       |
| `nasname`     | varchar(128) | IP ou hostname do MikroTik (via VPN)        |
| `shortname`   | varchar(32)  | Nome amigável (ex: `mikrotik-01`)           |
| `secret`      | varchar(60)  | Shared secret RADIUS (único por NAS)        |
| `type`        | varchar(30)  | Tipo (ex: `other`)                          |
| `description` | varchar(200) | Descrição livre                             |

---

## Atributos RADIUS Úteis para MikroTik

| Atributo                  | Exemplo de valor   | Função                                      |
| ------------------------- | ------------------ | ------------------------------------------- |
| `Mikrotik-Rate-Limit`     | `10M/10M`          | Limita velocidade down/up                   |
| `Session-Timeout`         | `3600`             | Expiração da sessão em segundos             |
| `Simultaneous-Use`        | `1`                | Máximo de sessões simultâneas               |
| `Framed-IP-Address`       | `10.10.10.x`       | IP fixo para o usuário                      |
| `Mikrotik-Address-List`   | `blocked`          | Adiciona usuário a uma address-list         |

---

## Schema Separado no Postgres

Para criar o schema `radius` e configurar o FreeRADIUS:

```sql
-- Criar schema separado
CREATE SCHEMA radius;

-- Garantir que o usuário do FreeRADIUS acessa apenas radius
GRANT USAGE ON SCHEMA radius TO radius_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA radius TO radius_user;
```

Configurar no FreeRADIUS (`mods-available/sql`):

```
sql {
  driver = "rlm_sql_postgresql"
  dialect = "postgresql"
  server = "127.0.0.1"
  port = 5432
  login = "radius_user"
  password = "..."
  radius_db = "hotspot_db"
  read_groups = yes
  schema = "radius"  # aponta para o schema separado
}
```

> Consulte a documentação oficial do FreeRADIUS 3.x para o schema PostgreSQL completo:  
> `raddb/mods-config/sql/main/postgresql/schema.sql`

---

## Recomendações

- **Não forçar UUID** no schema `radius` — use os tipos nativos (`serial`/`bigserial`) para compatibilidade com upgrades do FreeRADIUS.
- **Não gerenciar tabelas `radius.*` via Prisma** — use o schema SQL oficial.
- Usar **shared secret único por NAS** — nunca compartilhar o mesmo secret entre MikroTiks.
- Para ambientes com 200+ MikroTiks, configurar **redundância** (dois servidores FreeRADIUS com failover) é recomendado.
- Manter backups regulares de `radacct` — ela cresce continuamente.
