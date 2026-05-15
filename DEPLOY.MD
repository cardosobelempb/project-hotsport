# 🚀 Deploy biosurb no Portainer com Traefik


Guia completo para deploy da aplicação biosurb em produção usando **Portainer + Traefik + MySQL + Redis (preferencialmente via serviços Swarm)**.


---


## 🎯 Escolha seu Método de Deploy


### Opção 1: Registry Público (Docker Hub, GitHub, GitLab)


✅ Recomendado para CI/CD  
✅ Versionamento automático  
✅ Pull rápido no servidor  
❌ Requer conta em registry  
❌ Imagem fica pública (ou paga para privado)


👉 **Siga: [Parte 1.1 e 1.2](#12-push-para-registry)**


### Opção 2: Build Local + Import Direto (Sem Registry)


✅ Totalmente privado  
✅ Sem custos de registry  
✅ Sem necessidade de conta externa  
❌ Upload manual a cada atualização  
❌ Mais lento


👉 **Siga: [Parte 1.3 - Import Local](#13-opção-alternativa-importar-imagem-sem-registry)**  
🚀 **Automatizado: Use os scripts [deploy-local-to-vps.sh](deploy-local-to-vps.sh) ou [deploy-local-to-vps.ps1](deploy-local-to-vps.ps1)**


---


## 📋 Pré-requisitos


### 1. Servidor VPS Configurado


- ✅ Ubuntu 20.04+ ou Debian 11+
- ✅ Docker + Docker Compose instalados
- ✅ Portainer instalado e rodando
- ✅ Traefik configurado com certificados Let's Encrypt
- ✅ Network `network_public` criada


### 2. Serviços Externos Prontos


- ✅ **MySQL 8.0** rodando (pode ser container ou servidor dedicado)
- ✅ **Redis 7** rodando (pode ser container ou servidor dedicado)
- ✅ **Domínio configurado** apontando para o IP do servidor


### 3. Repositório de Imagens


- ✅ Conta no Docker Hub, GitHub Container Registry ou GitLab Registry
- ✅ Imagem Docker buildada e disponível


---


## 📦 Parte 1: Build e Push da Imagem


### 1.1 Build Local


```bash
# Na raiz do projeto
cd /f/workspace-saas/bio-pix-evolution/v1.0


# Build da imagem (substitua cardosobelempb pelo seu)
docker build -t cardosobelempb/biosurb:latest .


# Testar localmente (opcional)
docker run --rm cardosobelempb/biosurb:latest php -v
```


**Exemplo de Output:**


```
PHP 8.3.31 (cli) (built: May 10 2026 12:00:00) ( NTS )
```


### 1.2 Push para Registry


#### Docker Hub


```bash
# Login
docker login


# Push
docker push cardosobelempb/biosurb:latest
```


#### GitHub Container Registry


```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u cardosobelempb --password-stdin


# Tag
docker tag cardosobelempb/biosurb:latest ghcr.io/cardosobelempb/biosurb:latest


# Push
docker push ghcr.io/cardosobelempb/biosurb:latest
```


#### GitLab Container Registry


```bash
# Login
docker login registry.gitlab.com -u cardosobelempb


# Tag
docker tag cardosobelempb/biosurb:latest registry.gitlab.com/cardosobelempb/biosurb:latest


# Push
docker push registry.gitlab.com/cardosobelempb/biosurb:latest
```


### 1.3 Opção Alternativa: Importar Imagem Sem Registry


Se você **não quer usar registry público**, pode importar a imagem diretamente:


#### Passo 1: Build e Salvar Localmente


```bash
# Na sua máquina local (Windows/Mac/Linux)
cd /f/workspace-saas/bio-pix-evolution/v1.0


# Build da imagem
docker build -t cardosobelempb/biosurb:latest .


# Salvar imagem como arquivo .tar
docker save biosurb:latest -o biosurb.tar


# Verificar tamanho do arquivo
ls -lh biosurb.tar  # Linux/Mac
dir biosurb.tar      # Windows
```


**Tamanho esperado:** ~500MB-800MB (comprimido)


#### Passo 2: Comprimir (Opcional mas Recomendado)


```bash
# Comprimir para acelerar upload
gzip biosurb.tar
# Resultado: biosurb.tar.gz (~200MB-400MB)
```


#### Passo 3: Transferir para o Servidor VPS


**Opção A: SCP (Recomendado)**


```bash
# Transferir via SCP
scp biosurb.tar.gz usuario@IP_DO_SERVIDOR:/tmp/


# Exemplo:
scp biosurb.tar.gz root@192.168.1.100:/tmp/
```


**Opção B: SFTP**


```bash
sftp usuario@IP_DO_SERVIDOR
put biosurb.tar.gz /tmp/
exit
```


**Opção C: rsync (Melhor para conexões instáveis)**


```bash
rsync -avz --progress biosurb.tar.gz usuario@IP_DO_SERVIDOR:/tmp/
```


#### Passo 4: Importar no Servidor


```bash
# Conectar via SSH no servidor
ssh usuario@IP_DO_SERVIDOR


# Navegar para /tmp
cd /tmp


# Descomprimir (se comprimiu)
gunzip cardosobelempb-biosurb.tar.gz


# Importar imagem no Docker
docker load -i cardosobelempb-biosurb.tar


# Verificar importação
docker images | grep cardosobelempb-biosurb
```


**Output esperado:**


```
REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
biosurb       latest    abc123def456   5 minutes ago    450MB
```


#### Passo 5: Tag para Uso no Portainer


```bash
# Criar tag com nome que usará no stack
docker tag biosurb:latest cardosobelempb/biosurb:latest


# Ou usar nome local
docker tag biosurb:latest biosurb:production
```


#### Passo 6: Usar no Portainer


No `portainer-stack.yml`, use a imagem local:


```yaml
services:
  app:
    image: biosurb:latest # Nome da imagem local
    # ... resto da config
```


Ou nas variáveis de ambiente do Portainer:


```bash
DOCKER_IMAGE=cardosobelempb/cardosobelempb-biosurb:latest
```


#### Passo 7: Limpar Arquivo Temporário


```bash
# Remover arquivo .tar após importação
rm /tmp/biosurb.tar


# Voltar para sua máquina local
exit
```


**💡 Vantagens:**


- ✅ Não precisa de conta em registry público
- ✅ Mais privacidade (imagem não fica online)
- ✅ Deploy offline


**⚠️ Desvantagens:**


- ❌ Upload manual toda vez que atualizar
- ❌ Sem versionamento automático
- ❌ Lento para conexões ruins


---


## 🔧 Parte 2: Preparar MySQL e Redis


### 2.1 MySQL - Criar Database e Usuário


```bash
# Cenário recomendado: MySQL como serviço Docker Swarm (ex.: mysql_mysql)
# Entrar no MySQL dentro do serviço e criar database/usuário
docker exec -it $(docker ps -q -f name=mysql_mysql) mysql -uroot -p


# Dentro do MySQL
CREATE DATABASE IF NOT EXISTS biosurb_producao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'biosurb_user'@'%' IDENTIFIED BY 'Go9d9d73a9025299d576aa4990820ebd7d@';
GRANT ALL PRIVILEGES ON biosurb_producao.* TO 'biosurb_user'@'%';
FLUSH PRIVILEGES;
SHOW GRANTS FOR 'biosurb_user'@'%';
EXIT;


```


**Testar conexão:**


```bash
docker exec -it $(docker ps -q -f name=mysql_mysql) mysql -h127.0.0.1 -ubiosurb_user -p biosurb_producao -e "SELECT 1;"
```


> Nota: dentro do container da aplicação, o cliente `mysql` pode não existir. Para validar conexão pelo Laravel, use `php artisan tinker` e rode `DB::connection()->getPdo();`.


Se o MySQL for externo ao Swarm, use o IP/hostname do servidor externo em `DB_HOST` e ajuste firewall/bind-address nesse servidor.


### 2.2 Redis - Verificar se está Rodando


```bash
# Testar conexão
redis-cli -h localhost ping
# Output esperado: PONG


# Se precisar configurar senha
redis-cli
CONFIG SET requirepass "SENHA_REDIS_AQUI"
CONFIG REWRITE
EXIT
```


---


## 🌐 Parte 3: Configurar DNS e Traefik


### 3.1 Configurar DNS


No seu provedor de DNS (Cloudflare, AWS Route53, etc):


```
Tipo: A
Nome: biosurb (ou @)
Valor: IP_DO_SEU_SERVIDOR
TTL: 300
```


**Verificar propagação:**


```bash
dig biosurb.exemplo.com
nslookup biosurb.exemplo.com
```


### 3.2 Verificar Traefik


```bash
# Verificar se Traefik está rodando
docker ps | grep traefik


# Verificar network
docker network inspect network_public
```


**Configuração mínima do Traefik** (já deve estar configurada):


```yaml
# docker-compose.yml do Traefik
services:
  traefik:
    image: traefik:v3.0
    command:
      - --api.dashboard=true
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - [--certificatesresolvers.letsencryptresolver.acme.email=seu-email@exemplo.com](mailto:--certificatesresolvers.letsencryptresolver.acme.email=seu-email@exemplo.com)
      - --certificatesresolvers.letsencryptresolver.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.letsencryptresolver.acme.httpchallenge.entrypoint=web
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - traefik_letsencrypt:/letsencrypt
    networks:
      - network_public
```


---


## 🎯 Parte 4: Deploy no Portainer


### 4.1 Acessar Portainer


```
URL: https://seu-servidor:9443
Login: admin
```


### 4.2 Criar Stack


1. **Portainer > Stacks > ➕ Add stack**
2. **Nome:** `biosurb-production`
3. **Build method:** Web editor
4. **Web editor:** Copiar conteúdo de `portainer-stack.yml`


### 4.3 Configurar Variáveis de Ambiente


Na seção **Environment variables**, adicione:


```bash
# IMAGEM
DOCKER_IMAGE=cardosobelempb/biosurb:latest


# DOMÍNIO (Traefik)
APP_DOMAIN=bio.surb.exemplo.com
APP_URL=https://bio.surb.exemplo.com


# APP KEY (GERAR NOVA!)
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


# MYSQL
# Cenário recomendado: MySQL em serviço Swarm
# Use o nome do serviço Docker (DNS interno do Swarm)
DB_HOST=mysql_mysql
DB_PORT=3306
DB_DATABASE=biosurb_producao
DB_USERNAME=biosurb_user
DB_PASSWORD=Go9d9d73a9025299d576aa4990820ebd7d@


# REDIS
# Se Redis também estiver em serviço Swarm, use nome do serviço (ex.: redis_redis)
REDIS_HOST=redis_redis
REDIS_PORT=6379
REDIS_PASSWORD=


# biosurb
biosurb_TRIAL_DAYS=14
biosurb_MP_PLATFORM_ACCESS_TOKEN=APP_USR-xxxxx-xxxxx-xxxxx
biosurb_MP_PLATFORM_SANDBOX=false


# EMAIL (Opcional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.exemplo.com
MAIL_PORT=587
[MAIL_USERNAME=noreply@biosurb.com](mailto:MAIL_USERNAME=noreply@biosurb.com)
MAIL_PASSWORD=senha_email
MAIL_ENCRYPTION=tls
[MAIL_FROM_ADDRESS=noreply@biosurb.com](mailto:MAIL_FROM_ADDRESS=noreply@biosurb.com)
```


**💡 Importante:**


- Se MySQL/Redis estão em serviços Swarm, prefira DNS interno (`mysql_mysql`, `redis_redis`).
- App e banco/cache precisam compartilhar ao menos uma rede overlay.
- Só use IP (`172.x.x.x`/`192.168.x.x`) quando o serviço estiver fora da rede do stack.


### 4.4 Gerar APP_KEY


```bash
# Usando a imagem Docker
docker run --rm biosurb:latest php artisan key:generate --show


# Output:
# base64:AbCdEfGhIjKlMnOpQrStUvWxYz1234567890+/=
```


Copie o valor **completo** (incluindo `base64:`) e cole na variável `APP_KEY`.


Se quiser validar o tamanho da chave gerada (deve dar 32 bytes):


```bash
docker run --rm cardosobelempb/cardosobelempb-biosurb:latest php -r "echo strlen(base64_decode(substr('base64:PO3i8dFmmGhAZYKzNVLn1W+K+VXVufyGd4rXzwoqOKM=', 7))).PHP_EOL;"
```


**Validação recomendada (deve retornar `32`):**


```bash
APP_CID=$(docker ps -q -f name=biosurb-production_app)
docker exec -it "$APP_CID" sh -lc "php artisan tinker --execute='echo strlen(base64_decode(substr(config(\"app.key\"),7))).PHP_EOL;'"
```


### 4.5 Deploy da Stack


1. Clique em **Deploy the stack**
2. Aguarde 30-60 segundos
3. Verificar logs: **Portainer > Stacks > biosurb-production > [container] > Logs**


---


## ✅ Parte 5: Setup Inicial da Aplicação


### 5.1 Executar Migrations


```bash
# Encontrar nome do container app
docker ps | grep biosurb


# Executar migrations
docker exec -it biosurb-production_app.xxxxxx.xxxxxx sh


# Dentro do container:
php artisan migrate --force
php artisan storage:link
mkdir -p /var/www/html/resources/views /var/www/html/storage/framework/views
php artisan optimize:clear || true
php artisan config:cache
php artisan route:cache
php artisan view:cache


exit
```


### 5.2 Verificar Aplicação


```bash
# Acessar no navegador
[https://biosurb.exemplo.com](https://biosurb.exemplo.com)


# Verificar certificado SSL (deve estar válido)
# Verificar CSS e JS (devem carregar)
```


---


## 🔍 Parte 6: Verificações e Troubleshooting


### 6.1 Verificar Containers Rodando


```bash
docker ps --filter "name=biosurb"
```


**Output esperado:**


```
CONTAINER ID   IMAGE                    STATUS         PORTS
abc123def456   cardosobelempb/biosurb:latest   Up 2 minutes
def456ghi789   cardosobelempb/biosurb:latest   Up 2 minutes   (queue)
ghi789jkl012   cardosobelempb/biosurb:latest   Up 2 minutes   (scheduler)
```


### 6.2 Verificar Logs


```bash
# App (Nginx + PHP-FPM)
docker logs biosurb-production_app.1.xxxxxx --tail 50


# Queue Worker
docker logs biosurb-production_queue.1.xxxxxx --tail 50


# Scheduler
docker logs biosurb-production_scheduler.1.xxxxxx --tail 50
```


### 6.3 Testar Conectividade


**Testar MySQL:**


```bash
docker exec -it biosurb-production_app.1.xxxxxx sh
php artisan tinker
>>> DB::connection()->getPdo();
>>> exit
```


**Testar Redis:**


```bash
docker exec -it biosurb-production_app.1.xxxxxx sh
php artisan tinker
>>> Cache::getStore()->getRedis()->ping();
# Output: true
>>> exit
```


### 6.4 Problemas Comuns


#### ❌ Erro: "Connection refused" ou "No such file or directory" MySQL


**Solução:**


```bash
# 1. Confirmar serviço MySQL no Swarm
docker service ls | grep -Ei "mysql|mariadb"


# 2. Conferir DB_HOST da app (deve ser nome do serviço)
# Exemplo: DB_HOST=mysql_mysql


# 3. Verificar se app e mysql estão em rede overlay comum
docker service inspect mysql_mysql --format '{{json .Spec.TaskTemplate.Networks}}'
docker service inspect biosurb-production_app --format '{{json .Spec.TaskTemplate.Networks}}'


# 4. Testar porta do MySQL a partir da app
docker exec -it $(docker ps -q -f name=biosurb-production_app) sh -lc 'nc -zv mysql_mysql 3306'


# 5. Validar conexão Laravel
docker exec -it $(docker ps -q -f name=biosurb-production_app) sh -lc 'php artisan tinker --execute="DB::connection()->getPdo(); echo \"OK\\n\";"'
```


Se o MySQL for externo ao Swarm, aí sim use IP/hostname externo em `DB_HOST` e valide `bind-address` + firewall no servidor desse banco.


#### ❌ Erro: "Redis connection refused"


**Solução:**


```bash
# 1. Testar conexão do container até Redis
docker exec -it $(docker ps -q -f name=biosurb-production_app) sh -lc 'nc -zv $REDIS_HOST $REDIS_PORT'


# 2. Se Redis for serviço Swarm, use nome do serviço (ex.: redis_redis)
# REDIS_HOST=redis_redis


# 3. Verificar rede compartilhada entre app e redis
docker service inspect biosurb-production_app --format '{{json .Spec.TaskTemplate.Networks}}'
docker service inspect redis_redis --format '{{json .Spec.TaskTemplate.Networks}}'


# 4. Se Redis for externo, use IP/hostname externo em REDIS_HOST
```


#### ❌ Erro: "No application encryption key"


**Solução:**


```bash
# Gerar novo APP_KEY
docker run --rm cardosobelempb/biosurb:latest php artisan key:generate --show


# Atualizar variável de ambiente no Portainer
# Reiniciar stack
```


#### ❌ Erro: "Unsupported cipher or incorrect key length"


**Causa:** `APP_KEY` inválida (formato/tamanho incorreto).


**Solução:**


```bash
# 1. Gerar nova chave válida
docker run --rm cardosobelempb/biosurb:latest php artisan key:generate --show


# 2. Atualizar APP_KEY no Portainer (valor completo base64:...)
# 3. Recriar caches
APP_CID=$(docker ps -q -f name=biosurb-production_app)


docker exec "$APP_CID" php artisan optimize:clear
docker exec "$APP_CID" php artisan config:cache
docker exec "$APP_CID" php artisan route:cache
docker exec "$APP_CID" php artisan view:cache



# 4. Validar tamanho da chave (deve imprimir 32)
docker exec -it "$APP_CID" php artisan tinker --execute='echo strlen(base64_decode(str_replace("base64:", "", config("app.key"))));'
```


> Atenção: se você restaurou dump antigo, trocar `APP_KEY` pode invalidar dados criptografados salvos anteriormente.


#### ❌ Erro: "View path not found"


**Causa:** diretórios de view ausentes no container.


**Solução:**


```bash
APP_CID=$(docker ps -q -f name=biosurb-production_app)
docker exec -it "$APP_CID" sh -lc 'mkdir -p /var/www/html/resources/views /var/www/html/storage/framework/views'
docker exec -it "$APP_CID" sh -lc 'php artisan optimize:clear || true'
docker exec -it "$APP_CID" sh -lc 'php artisan config:cache && php artisan route:cache && php artisan view:cache'
```


#### ❌ Traefik não roteia (504 Gateway Timeout)


**Solução:**


```bash
# Verificar labels do container
docker inspect biosurb-production_app.1.xxxxxx | grep -A 10 Labels


# Verificar se container está na network_public
docker inspect network_public | grep biosurb


# Verificar logs do Traefik
docker logs traefik_container_name | grep biosurb
```


---


## 🔄 Parte 7: Atualizar Aplicação


### 7.1 Build e Push Nova Versão


```bash
# Build nova versão
docker build -t cardosobelempb/biosurb:v1.1.0 .
docker push cardosobelempb/biosurb:v1.1.0


# Ou latest
docker build -t cardosobelempb/biosurb:latest .
docker push cardosobelempb/biosurb:latest
```


### 7.2 Atualizar Stack no Portainer


**Opção 1: Pull e Restart (Recomendado)**


```bash
# SSH no servidor
ssh usuario@seu-servidor


# Pull nova imagem
docker pull cardosobelempb/biosurb:latest


# Portainer > Stacks > biosurb-production > Update the stack
# Marcar: "Re-pull image and redeploy"
# Clicar em "Update"
```


**Opção 2: Via CLI**


```bash
# SSH no servidor
cd /opt/stacks/biosurb-production  # ou onde está o stack


# Pull e restart
docker pull cardosobelempb/biosurb:latest
docker service update --force biosurb-production_app
docker service update --force biosurb-production_queue
docker service update --force biosurb-production_scheduler
```


### 7.3 Executar Migrations (se houver)


```bash
docker exec -it biosurb-production_app.1.xxxxxx sh
php artisan migrate --force
php artisan config:cache
exit
```


---


## 📊 Parte 8: Monitoramento


### 8.1 Verificar Health Checks


```bash
# Ver status de saúde dos containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```


### 8.2 Logs em Tempo Real


```bash
# App
docker logs -f biosurb-production_app.1.xxxxxx


# Queue (útil para debugar webhooks)
docker logs -f biosurb-production_queue.1.xxxxxx
```


### 8.3 Métricas Importantes


**Storage disponível:**


```bash
docker exec biosurb-production_app.1.xxxxxx df -h /var/www/html/storage
```


**Uso de memória:**


```bash
docker stats biosurb-production_app.1.xxxxxx --no-stream
```


---


## 🔐 Parte 9: Segurança


### 9.1 Checklist de Segurança


- ✅ `APP_DEBUG=false` em produção
- ✅ `APP_ENV=production`
- ✅ APP_KEY única e forte
- ✅ Senhas fortes para MySQL e Redis
- ✅ Firewall configurado (UFW/iptables)
- ✅ Backups automáticos do banco
- ✅ HTTPS ativo (certificado válido)
- ✅ Headers de segurança configurados no Nginx


### 9.2 Configurar Backups


**MySQL Backup Diário:**


```bash
# Criar script de backup
sudo nano /opt/scripts/backup-biosurb-mysql.sh
```


```bash
#!/bin/bash
BACKUP_DIR="/backups/biosurb-mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR


docker exec mysql_container_name mysqldump \
  -u biosurb_user \
  -p'SENHA_MYSQL' \
  biosurb_producao \
  > $BACKUP_DIR/biosurb_$DATE.sql


# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```


```bash
# Tornar executável
chmod +x /opt/scripts/backup-biosurb-mysql.sh


# Adicionar no cron
crontab -e
# Adicionar linha:
0 3 * * * /opt/scripts/backup-biosurb-mysql.sh
```


---


## 📚 Referências


- **Arquivo Stack:** [`portainer-stack.yml`](portainer-stack.yml)
- **Variáveis de Ambiente:** [`.env.production.example`](.env.production.example)
- **Guia Docker Completo:** [`DEPLOY_DOCKER.md`](DEPLOY_DOCKER.md)
- **Dockerfile:** [`Dockerfile`](Dockerfile)


---


## 🆘 Suporte


Se encontrar problemas:


1. Verificar logs dos containers
2. Testar conectividade MySQL/Redis
3. Verificar configurações do Traefik
4. Consultar seção de Troubleshooting acima


**Comandos úteis para debug:**


```bash
# Ver todas as stacks
docker stack ls


# Ver serviços da stack
docker stack services biosurb-production


# Ver tasks de um serviço
docker service ps biosurb-production_app --no-trunc


# Executar comandos no container
docker exec -it $(docker ps -q -f name=biosurb-production_app) sh
```

# ==============================================
# BioPix - Variáveis de Ambiente PRODUÇÃO (Portainer)
# ==============================================
# Use este arquivo como referência para configurar o Portainer Stack
# Defina estas variáveis em: Portainer > Stacks > [Sua Stack] > Environment variables
#
# IMPORTANTE: Nunca commite este arquivo com valores reais!
# ==============================================


# ---------------------------------------------
# IMAGEM DOCKER
# ---------------------------------------------
DOCKER_IMAGE=cardosobelempb/cardosobelempb-biosurb:latest
# Exemplo: ghcr.io/seu-usuario/biopix:v1.0.0
# Exemplo: registry.gitlab.com/seu-usuario/biopix:latest


# ---------------------------------------------
# DOMÍNIO & APP (TRAEFIK)
# ---------------------------------------------
APP_DOMAIN=bio.surb.com.br
# Seu domínio configurado no DNS apontando para o servidor
# Este domínio será usado pelo Traefik para roteamento HTTPS


APP_URL=https://bio.surb.com.br
# URL completa da aplicação (HTTPS obrigatório em produção)


APP_KEY=base64:PO3i8dFmmGhAZYKzNVLn1W+K+VXVufyGd4rXzwoqOKM=
# Gerar com: docker run --rm seu-usuario/biopix php artisan key:generate --show


# ---------------------------------------------
# DATABASE (MySQL Externo)
# ---------------------------------------------
DB_HOST=mysql_mysql
# IP ou hostname do servidor MySQL
# Se MySQL estiver na mesma rede Docker: nome_do_servico_mysql


DB_PORT=3306
DB_DATABASE=biosurb_producao
DB_USERNAME=biosurb_user
DB_PASSWORD=Go9d9d73a9025299d576aa4990820ebd7d@


# ---------------------------------------------
# REDIS (Cache & Sessions)
# ---------------------------------------------
REDIS_HOST=redis
# IP ou hostname do servidor Redis
# Se Redis estiver na mesma rede Docker: nome_do_servico_redis


REDIS_PORT=6379
REDIS_PASSWORD=824eocpzuwzskevuW5oHUqT8AwJn7bkr
# Deixe vazio se Redis não tiver senha, ou configure senha segura


# ---------------------------------------------
# BIOPIX CONFIGURAÇÕES
# ---------------------------------------------
BIOPIX_TRIAL_DAYS=14
# Dias de trial gratuito para novos usuários


BIOPIX_MP_PLATFORM_ACCESS_TOKEN=APP_USR-000000000000000-000000-0000000000000000000000000000000-000000000
# Access Token da aplicação Platform no Mercado Pago
# Obter em: [https://www.mercadopago.com.br/developers/panel/app](https://www.mercadopago.com.br/developers/panel/app)


BIOPIX_MP_PLATFORM_SANDBOX=false
# true = Modo teste | false = Modo produção


# ---------------------------------------------
# EMAIL (Opcional - Para notificações)
# ---------------------------------------------
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
[MAIL_USERNAME=contato@surb.com.br](mailto:MAIL_USERNAME=contato@surb.com.br)
MAIL_PASSWORD=Java262011@
MAIL_ENCRYPTION=tls
[MAIL_FROM_ADDRESS=contato@surb.com.br](mailto:MAIL_FROM_ADDRESS=contato@surb.com.br)


# ---------------------------------------------
# OBSERVAÇÕES IMPORTANTES
# ---------------------------------------------
# ✅ APP_KEY: Gerar SEMPRE uma nova key para produção
# ✅ DB_PASSWORD: Usar senha forte (16+ caracteres, letras, números, símbolos)
# ✅ REDIS_PASSWORD: Recomendado configurar senha no Redis
# ✅ Todas as senhas devem ser únicas e não reutilizadas
# ✅ Backup regular do banco de dados é OBRIGATÓRIO
# ✅ Certifique-se que APP_DOMAIN está apontando para o IP do servidor no DNS

