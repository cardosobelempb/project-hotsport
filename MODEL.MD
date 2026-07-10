# Hotspot SaaS Monetizado - Arquitetura de Marketing e Publicidade

## Objetivo

Transformar o Hotspot SaaS da Surb em uma plataforma de marketing digital, publicidade e geração de receita, utilizando um servidor próprio de anúncios (Ad Server), campanhas patrocinadas e integração com programas de afiliados, mantendo conformidade com as políticas do Google AdSense.

---

# Visão Geral

O portal cativo do MikroTik será utilizado apenas para autenticação e identificação do usuário.

A monetização ocorrerá em um Portal Web desenvolvido pela Surb, permitindo exibição de campanhas, ofertas, cupons e conteúdos patrocinados antes e após a autenticação.

Essa arquitetura reduz riscos relacionados às políticas do Google AdSense e oferece total controle sobre a publicidade exibida.

---

# Arquitetura

```text
Cliente conecta ao Wi-Fi

        │
        ▼

Portal Cativo (MikroTik)

        │
        ▼

Portal Web Surb

- Informações
- Campanhas
- Ofertas
- Cupons
- Conteúdo Local

        │
        ▼

Cadastro / Login

        │
        ▼

API Hotspot

        │
        ▼

MikroTik libera acesso

        │
        ▼

Landing Page

- Promoções
- Produtos Afiliados
- Conteúdo
- Campanhas
```

---

# Módulos do Sistema

## Portal Captivo

Responsável por:

* Login
* Cadastro
* Login Social
* Voucher
* LGPD
* Termos de Uso

Não será utilizado para monetização direta com Google AdSense.

---

## Portal de Conteúdo

Será um site completo contendo:

* Notícias
* Eventos
* Promoções
* Cupons
* Guia Comercial
* Produtos em Destaque
* Empresas Parceiras

Este portal poderá receber campanhas publicitárias e programas de afiliados.

---

# Surb Ad Server

O principal diferencial do projeto será um servidor próprio de publicidade.

Ele permitirá que empresas anunciem diretamente na plataforma, sem depender exclusivamente de redes externas.

Tipos de campanhas:

* Banner
* Banner Full Screen
* Vídeo
* Pop-up
* Oferta Patrocinada
* Produto Afiliado
* Cupom
* Pesquisa
* Pesquisa de Satisfação
* Promoção Local
* Campanha Institucional

---

# Motor de Campanhas

Cada campanha poderá possuir regras como:

* Data inicial
* Data final
* Horário
* Dias da semana
* Cidade
* Hotspot específico
* Perfil do usuário
* Primeiro acesso
* Tempo conectado
* Número de acessos
* Tipo de dispositivo
* Sistema operacional

---

# Sistema de Segmentação

O servidor poderá entregar campanhas por:

* Cidade
* Bairro
* Empresa
* Shopping
* Restaurante
* Hotel
* Academia
* Escola
* Evento
* Perfil do usuário
* Faixa etária
* Sexo
* Histórico de acesso

---

# Monetização

## Receita Própria

Venda de espaços publicitários.

Exemplos:

* Banner da empresa local.
* Promoção patrocinada.
* Restaurante próximo.
* Loja parceira.
* Evento da cidade.

---

## Afiliados

Integração via API com:

* Shopee
* Mercado Livre
* Amazon
* Hotmart
* Eduzz
* Monetizze
* Braip
* Awin
* CJ Affiliate

Produtos poderão ser exibidos automaticamente conforme categorias e campanhas.

---

## Google AdSense

O AdSense será utilizado apenas no Portal de Conteúdo, onde houver conteúdo relevante e original, evitando seu uso na tela de login do portal cativo.

---

# Painel Administrativo

O administrador poderá:

* Criar campanhas
* Definir períodos
* Gerenciar banners
* Upload de vídeos
* Criar cupons
* Gerenciar patrocinadores
* Aprovar campanhas
* Visualizar estatísticas
* Controlar receita

---

# Dashboard

Indicadores principais:

* Impressões
* Cliques
* CTR
* Conversões
* Receita
* Campanhas ativas
* Usuários conectados
* Tempo médio conectado
* Empresas anunciantes
* Produtos mais clicados

---

# Inteligência de Marketing

O sistema poderá gerar recomendações automáticas como:

* Melhor horário para anunciar.
* Melhor campanha.
* Produtos com maior conversão.
* Empresas com melhor desempenho.
* Ranking de Hotspots.
* Ranking de campanhas.

---

# Diferenciais Competitivos

* Ad Server próprio.
* Plataforma White Label.
* Integração completa com MikroTik.
* API REST.
* Segmentação avançada.
* Dashboard analítico.
* Marketplace de anúncios.
* Marketplace de ofertas.
* Integração com afiliados.
* Escalável para múltiplos clientes (SaaS Multiempresa).

---

# Objetivo Final

Criar um ecossistema onde o Hotspot deixa de ser apenas uma ferramenta de autenticação Wi-Fi e passa a ser uma plataforma inteligente de publicidade, relacionamento e geração de receita recorrente.

O foco principal será a venda de campanhas para empresas locais e nacionais através do **Surb Ad Server**, utilizando programas de afiliados e o Google AdSense apenas como fontes complementares de monetização, aumentando o controle, a rentabilidade e a escalabilidade da plataforma.
