# Docker Cheat Sheet — Guia Completo de Comandos

O Docker possui comandos específicos para diferentes tipos de tarefas. De acordo com seu objetivo, eles podem ser organizados nas seguintes categorias:

- 🏗️ **Comandos de Build** — Criam imagens a partir de um `Dockerfile`.
- 🧹 **Comandos de Limpeza** — Removem imagens, containers e volumes sem uso para liberar espaço.
- 📦 **Comandos de Interação com Containers** — Gerenciam e controlam containers.
- 🔍 **Comandos de Inspeção de Containers** — Exibem informações e auxiliam no troubleshooting.
- 🖼️ **Comandos de Gerenciamento de Imagens** — Administram imagens Docker.
- ▶️ **Comando `run`** — Cria e executa containers a partir de imagens.
- ☁️ **Comandos de Registry** — Interagem com registries remotos, como o Docker Hub.
- ⚙️ **Comandos de Serviços** — Gerenciam serviços no Docker Swarm.
- 🌐 **Comandos de Rede** — Configuram e administram redes Docker.

---

# 🏗️ Comandos de Build

O comando `docker build` é utilizado para construir imagens a partir de um **Dockerfile**.

| Comando | Descrição |
|----------|-----------|
| `docker build` | Cria uma imagem utilizando o Dockerfile presente no diretório atual. |
| `docker build https://github.com/docker/rootfs.git#container:docker` | Cria uma imagem a partir de um repositório Git remoto. |
| `docker build -t nome_da_imagem:tag` | Cria uma imagem e adiciona uma tag para facilitar sua identificação. |
| `docker build https://seuservidor/arquivo.tar.gz` | Constrói uma imagem utilizando um arquivo TAR remoto. |
| `docker build -t image:1.0 - <<EOF ... EOF` | Cria uma imagem utilizando um Dockerfile enviado via **STDIN**. |

---

# 🧹 Comandos de Limpeza

Esses comandos removem recursos não utilizados, liberando espaço em disco.

| Comando | Descrição |
|----------|-----------|
| `docker image prune` | Remove imagens dangling (sem tag). |
| `docker image prune -a` | Remove todas as imagens que não estão sendo utilizadas por containers. |
| `docker system prune` | Remove containers parados, redes não utilizadas, imagens dangling e cache de build. |
| `docker image rm nome-da-imagem` | Remove uma imagem específica. |
| `docker rm container` | Remove um container. |
| `docker swarm leave` | Sai de um Swarm. |
| `docker stack rm nome_do_stack` | Remove uma Stack do Swarm. |
| `docker volume rm $(docker volume ls -f dangling=true -q)` | Remove todos os volumes dangling. |
| `docker rm $(docker ps -a -q)` | Remove todos os containers parados. |
| `docker kill $(docker ps -q)` | Interrompe todos os containers em execução. |

---

# 📦 Comandos de Interação com Containers

Permitem iniciar, parar e administrar containers.

| Comando | Descrição |
|----------|-----------|
| `docker start container` | Inicia um container. |
| `docker stop container` | Para um container. |
| `docker pause container` | Pausa um container. |
| `docker unpause container` | Retoma um container pausado. |
| `docker restart container` | Reinicia um container. |
| `docker export container` | Exporta o conteúdo do container para um arquivo TAR. |
| `docker attach container` | Conecta ao container em execução. |
| `docker wait container` | Aguarda o término do container e retorna o código de saída. |
| `docker commit -m "mensagem" -a "autor" container imagem:tag` | Salva um container como uma nova imagem. |
| `docker logs -ft container` | Exibe logs em tempo real. |
| `docker exec -ti container script.sh` | Executa um comando dentro do container. |
| `docker commit container image` | Cria uma nova imagem a partir de um container. |
| `docker create image` | Cria um novo container sem iniciá-lo. |

---

# 🔍 Comandos de Inspeção de Containers

Utilizados para análise, monitoramento e troubleshooting.

| Comando | Descrição |
|----------|-----------|
| `docker ps` | Lista os containers em execução. |
| `docker ps -a` | Lista todos os containers. |
| `docker diff container` | Mostra alterações realizadas no sistema de arquivos do container. |
| `docker top container` | Lista os processos em execução dentro do container. |
| `docker inspect container` | Exibe informações detalhadas do container. |
| `docker logs container` | Exibe os logs do container. |
| `docker stats container` | Mostra estatísticas de consumo de recursos. |

---

# 🖼️ Comandos de Gerenciamento de Imagens

Gerenciam imagens Docker disponíveis localmente.

| Comando | Descrição |
|----------|-----------|
| `docker image ls` | Lista todas as imagens disponíveis. |
| `docker image rm mysql` | Remove uma imagem. |
| `docker tag` | Adiciona uma tag a uma imagem. |
| `docker history image` | Exibe o histórico de criação da imagem. |
| `docker inspect image` | Exibe informações detalhadas da imagem. |

---

# ▶️ Comando `docker run`

O comando `docker run` cria e executa um container a partir de uma imagem.

## Sintaxe

```bash
docker run [opções] imagem [comando] [argumentos]
```

## Principais opções

| Flag | Descrição |
|------|-----------|
| `--detach`, `-d` | Executa o container em segundo plano. |
| `--env`, `-e` | Define variáveis de ambiente. |
| `--hostname`, `-h` | Define um hostname para o container. |
| `--label`, `-l` | Adiciona metadados (labels). |
| `--name` | Define um nome para o container. |
| `--network` | Conecta o container a uma rede Docker. |
| `--rm` | Remove automaticamente o container ao finalizar sua execução. |
| `--read-only` | Define o sistema de arquivos como somente leitura. |
| `--workdir`, `-w` | Define o diretório de trabalho dentro do container. |

---

# ☁️ Comandos de Registry

Permitem interagir com registries como o Docker Hub.

| Comando | Descrição |
|----------|-----------|
| `docker login` | Realiza login em um registry. |
| `docker logout` | Encerra a sessão do registry. |
| `docker pull mysql` | Baixa uma imagem do registry. |
| `docker push repo/rhel-httpd:latest` | Envia uma imagem para um registry. |
| `docker search termo` | Pesquisa imagens no Docker Hub. |

---

# ⚙️ Comandos de Serviços (Docker Swarm)

Gerenciam serviços executados em clusters Docker Swarm.

| Comando | Descrição |
|----------|-----------|
| `docker service ls` | Lista todos os serviços do Swarm. |
| `docker stack services nome_da_stack` | Lista os serviços de uma Stack. |
| `docker service ps nome_do_serviço` | Lista as tarefas de um serviço. |
| `docker service update nome_do_serviço` | Atualiza um serviço. |
| `docker service create image` | Cria um novo serviço. |
| `docker service scale nome_do_serviço=10` | Ajusta a quantidade de réplicas do serviço. |
| `docker service logs nome_do_serviço` | Exibe os logs de um serviço. |

---

# 🌐 Comandos de Rede

Gerenciam as redes utilizadas pelos containers.

| Comando | Descrição |
|----------|-----------|
| `docker network create nome_da_rede` | Cria uma nova rede. |
| `docker network rm nome_da_rede` | Remove uma rede. |
| `docker network ls` | Lista todas as redes disponíveis. |
| `docker network connect nome_da_rede container` | Conecta um container a uma rede. |
| `docker network disconnect nome_da_rede container` | Desconecta um container de uma rede. |
| `docker network inspect nome_da_rede` | Exibe informações detalhadas sobre uma rede. |

---

# 📚 Resumo das Categorias

| Categoria | Finalidade |
|-----------|------------|
| 🏗️ Build | Construção de imagens |
| 🧹 Limpeza | Remoção de recursos não utilizados |
| 📦 Containers | Gerenciamento de containers |
| 🔍 Inspeção | Diagnóstico e monitoramento |
| 🖼️ Imagens | Administração de imagens |
| ▶️ Run | Criação e execução de containers |
| ☁️ Registry | Envio e download de imagens |
| ⚙️ Serviços | Gerenciamento do Docker Swarm |
| 🌐 Rede | Configuração e administração das redes Docker |

---

> 💡 **Dica:** Salve este documento como uma referência rápida (**Docker Cheat Sheet**) para consultar sempre que precisar lembrar a sintaxe ou a finalidade de um comando.