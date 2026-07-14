# Guia de Cadastro — MikroTik e VPN WireGuard

> Guia operacional para **suporte** e **clientes** preencherem corretamente os formularios de Adicionar/Editar Mikrotik e de VPN WireGuard no painel admin.
>
> Nao e um documento tecnico de arquitetura — para isso ver `docs/WIREGUARD-VPN.md`. Aqui o foco e "o que clicar e o que preencher".

---

## 1. Antes de comecar: meu MikroTik precisa de VPN?

| Situacao | Precisa de VPN WireGuard? |
|---|---|
| MikroTik tem IP publico fixo, ou esta na mesma rede do servidor | **Nao** — usar IP direto no cadastro |
| MikroTik esta atras de roteador da operadora/CGNAT, IP muda ou e privado (ex: `192.168.x.x`, `10.x.x.x` por tras de outro roteador) | **Sim** — precisa criar um peer VPN antes de cadastrar o Mikrotik |
| Nao sei / nao tenho certeza | Testar sem VPN primeiro (Passo 3). Se o teste de conexao falhar e o IP for privado, seguir para o Passo 2 |

Se a resposta for "Sim", siga o **Passo 2** antes de cadastrar o Mikrotik. Se for "Nao", pule direto para o **Passo 3**.

---

## 2. Criar o peer VPN (somente se o MikroTik estiver atras de NAT)

Menu: **VPN** (`/admin/:empresa/vpn`)

### 2.1 Adicionar Peer

1. Clicar em **+ Adicionar Peer**
2. Em **Identificacao (Nome do Mikrotik)**, digitar um nome que identifique o equipamento (ex: `RB-Loja-Centro`, `RB-Torre-01`). Esse nome e so pra voce reconhecer o peer na lista — nao precisa ser igual ao nome que sera usado no cadastro do Mikrotik.
3. Clicar em **Salvar e Gerar Script**

Um script RouterOS sera exibido automaticamente.

### 2.2 Instalar o script no MikroTik

1. Copiar o script exibido (botao de copiar no canto do bloco de codigo)
2. Abrir o Winbox (ou terminal via SSH) do MikroTik
3. Ir em **New Terminal**
4. Colar o script e apertar Enter
5. Aguardar alguns segundos — o MikroTik vai se conectar automaticamente ao servidor

### 2.3 Confirmar que a VPN conectou

1. Voltar na tela **VPN** do painel
2. Localizar o peer criado na tabela
3. Verificar a coluna **Status**:
   - 🟢 **Online** = conectado, pode prosseguir
   - 🔴 **Offline** = ainda nao conectou (aguardar ~30s e atualizar a pagina, ou revisar o script no MikroTik)
4. Anotar o valor da coluna **IP VPN** (formato `10.8.0.X`) — esse IP sera usado no cadastro do Mikrotik (Passo 3)

> Se o peer nao ficar online apos alguns minutos, verificar se a porta UDP da VPN esta liberada no roteador/operadora do cliente (a porta em uso aparece em **Configuracoes** > **Porta UDP do WireGuard**, no topo da tela VPN).

---

## 3. Cadastrar o MikroTik

Menu: **Mikrotiks** (`/admin/:empresa/mikrotiks`)

1. Clicar em **Adicionar Mikrotik**
2. Preencher os campos conforme a tabela abaixo
3. Clicar em **Adicionar**

### 3.1 Campos do formulario

| Campo | Obrigatorio? | O que preencher |
|---|---|---|
| **Nome** | Sim | Nome pra identificar o equipamento na lista (ex: "Mikrotik Recepcao", "RB Torre Centro") |
| **Endereco IP** | Sim | IP de acesso ao Mikrotik. **Se o equipamento tem VPN configurada (Passo 2), usar o mesmo IP local que o MikroTik ja usa na rede dele** (ex: `192.168.88.1`) — nao o IP da VPN aqui |
| **IP VPN (WireGuard)** | So se usa VPN | O IP `10.8.0.X` anotado no Passo 2.3. Deixar em branco se o Mikrotik tem IP publico/acesso direto |
| **Usuario** | Sim | Usuario de acesso a API do MikroTik (normalmente `admin` ou um usuario dedicado com permissao API) |
| **Porta API** | Sim | Porta da API RouterOS. Padrao: `8728`. So mudar se o cliente alterou a porta da API no proprio MikroTik |
| **Senha** | Sim | Senha do usuario informado acima |
| **Endereco Hotspot** | Nao (preenchido automaticamente pelo wizard) | Deixar em branco no cadastro inicial — sera preenchido sozinho ao rodar o **Wizard de Hotspot** (Passo 4). So editar manualmente em casos excepcionais |
| **Portal Captive** | Recomendado | Qual portal (pagina de login) sera exibido pros clientes desse Mikrotik. Selecionar na lista. Pode deixar "Nenhum" e configurar depois em **Portais** |

> **Regra pratica:** quando o Mikrotik esta atras de NAT (usa VPN), o sistema se conecta a API dele pelo IP VPN automaticamente nos bastidores — o campo **Endereco IP** continua sendo o IP local da rede do cliente, so serve como identificacao/fallback.

### 3.2 Testar a conexao

Depois de salvar, o sistema tenta conectar automaticamente e mostra um status na tabela:

- 🟢 **Online** = credenciais e IP corretos, pode prosseguir pro wizard
- 🔴 **Offline** = revisar usuario/senha/porta/IP. Passar o mouse sobre o status vermelho mostra o motivo do erro

Tambem e possivel forcar um novo teste clicando no icone de **tomada (Testar conexao)** na linha do Mikrotik.

**Erros comuns no teste de conexao:**

| Mensagem/sintoma | Causa provavel | Como resolver |
|---|---|---|
| Timeout / sem resposta | IP errado, ou MikroTik atras de NAT sem VPN configurada | Confirmar IP; se for NAT, seguir Passo 2 e preencher **IP VPN** |
| Invalid user name or password | Usuario/senha errados | Confirmar credenciais direto no Winbox |
| Connection refused | API desabilitada no MikroTik, ou porta errada | No Winbox: **IP > Services**, verificar se `api` esta habilitado na porta configurada |

---

## 4. Configurar o Hotspot (Wizard)

Depois que o Mikrotik aparece **Online**, configure o hotspot automaticamente:

1. Na linha do Mikrotik, clicar no icone **Wi-Fi (Configurar Hotspot)**
2. O sistema escaneia o equipamento e mostra as opcoes:

| Campo do wizard | O que e | Recomendacao |
|---|---|---|
| **Interface do Hotspot** | Porta/interface fisica onde o Wi-Fi/rede dos clientes esta ligada | Selecionar a interface correta (ex: `ether2`, `wlan1`) — errar aqui derruba a rede errada |
| **Endereco IP do Hotspot (gateway)** | IP que os clientes vao receber como gateway | Deixar o sugerido (`10.5.50.1/24`) salvo se ja existir outra faixa em uso nesse Mikrotik |
| **Nome do Pool** / **Range do Pool** | Faixa de IPs que sera distribuida aos clientes conectados | Manter sugestao, a menos que ja exista um pool com outro nome |
| **DNS Name** | Nome de dominio configurado no certificado SSL do Mikrotik (se houver) | Preencher **somente** se o cliente ja tem um dominio com certificado SSL configurado no hotspot. Deixar em branco se nao sabe |
| **IP do Servidor RADIUS** | IP que o MikroTik vai usar pra falar com o servidor de autenticacao | Se o Mikrotik usa VPN: usar o IP VPN do servidor (normalmente `10.8.0.1`, ja vem preenchido). Se usa IP direto: usar o IP publico do servidor |

3. Clicar em **Configurar Hotspot**
4. Acompanhar o log em tempo real — ao final deve aparecer `Configuracao finalizada com sucesso!`

O wizard configura automaticamente: cliente RADIUS, walled garden (liberacao do dominio do sistema), pool de IPs, e o redirecionamento de login para o portal vinculado.

> **Importante:** o wizard tambem envia as paginas `login.html` e `status.html` pro Mikrotik. Se precisar reenviar so uma delas depois (ex: apos trocar o portal), use os icones **Enviar login.html** (envelope verde) e **Enviar status.html** (monitor) na linha do equipamento — nao precisa rodar o wizard de novo.

---

## 5. Editar um Mikrotik existente

1. Na tabela **Mikrotiks**, clicar no icone de **lapis (Editar)** na linha do equipamento
2. O formulario abre com os dados atuais preenchidos
3. Alterar o que for necessario e clicar em **Atualizar**

**Motivos comuns pra editar:**
- Trocar o **Portal Captive** vinculado (ao salvar com um portal selecionado, o sistema reenvia o login automaticamente pro Mikrotik)
- Corrigir **IP**, **Usuario** ou **Senha** apos alteracao no equipamento
- Preencher/corrigir o **IP VPN** apos criar um peer novo

> Trocar apenas o **Endereco Hotspot** manualmente raramente e necessario — normalmente ele e ajustado automaticamente pelo wizard. So editar esse campo por orientacao tecnica.

---

## 6. Verificacoes depois de configurar

Use os icones de acao na linha do Mikrotik para validar que tudo funcionou:

| Icone | Acao | Quando usar |
|---|---|---|
| 🔌 Tomada | Testar conexao | Confirmar que o sistema ainda alcanca a API do Mikrotik |
| ℹ️ Info | Informacoes | Ver modelo, versao do RouterOS, uptime e uso de CPU |
| 📶 Atividade | Diagnostico do Hotspot | Verifica se `login.html`/`status.html` estao no lugar certo, se o hotspot server esta ativo e mostra alertas de configuracao incorreta |
| ✉️ Enviar | Enviar login.html | Reenvia so a pagina de login (sem rodar o wizard todo) |
| 🖥️ Monitor | Enviar status.html | Reenvia so a pagina exibida apos o login |

**Recomendacao:** sempre que o cliente reportar "a pagina de login nao aparece" ou "aparece a pagina padrao do Mikrotik", rodar primeiro o **Diagnostico do Hotspot** — ele aponta exatamente o que esta faltando antes de qualquer outra acao.

---

## 7. Checklist rapido (Mikrotik atras de NAT)

- [ ] Criar peer na tela **VPN** com nome identificavel
- [ ] Rodar o script RouterOS no terminal do Mikrotik
- [ ] Confirmar peer **Online** na tela VPN e anotar o **IP VPN**
- [ ] Cadastrar Mikrotik com IP local + campo **IP VPN** preenchido
- [ ] Confirmar status **Online** na tabela de Mikrotiks
- [ ] Rodar o **Wizard de Hotspot**, conferindo a interface correta
- [ ] Selecionar o **Portal Captive** desejado (no cadastro ou depois em Editar)
- [ ] Rodar **Diagnostico do Hotspot** pra confirmar tudo verde

## 8. Checklist rapido (Mikrotik com IP direto, sem NAT)

- [ ] Cadastrar Mikrotik com IP publico/local direto, campo **IP VPN** em branco
- [ ] Confirmar status **Online**
- [ ] Rodar o **Wizard de Hotspot**
- [ ] Selecionar o **Portal Captive**
- [ ] Rodar **Diagnostico do Hotspot**

---

## 9. Onde pedir ajuda tecnica

Se apos seguir este guia o Mikrotik continuar **Offline** ou o hotspot nao funcionar mesmo com o diagnostico "verde", escalar para o time tecnico informando:
- Nome/ID do Mikrotik no painel
- Se usa VPN ou IP direto
- Mensagem de erro exibida no teste de conexao (passar o mouse sobre o status vermelho)
- Resultado do **Diagnostico do Hotspot** (print da tela)
