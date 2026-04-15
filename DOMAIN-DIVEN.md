# 📘 Glossário de Domain-Driven Design (DDD)

## 📌 Visão Geral

O **Domain-Driven Design (DDD)** é uma abordagem de desenvolvimento de software focada em **entender profundamente o negócio (domínio)** e refletir esse entendimento na modelagem do sistema.

Seu principal objetivo é alinhar **tecnologia e regras de negócio**, permitindo criar soluções mais eficientes, organizadas e fáceis de evoluir. :contentReference[oaicite:0]{index=0}

---

## 🧠 Conceitos Fundamentais

### 🔹 Domínio

Refere-se ao **contexto de negócio** que o software resolve — incluindo regras, processos e conhecimentos envolvidos.

### 🔹 Linguagem Ubíqua (Ubiquitous Language)

Uma **linguagem comum** compartilhada entre desenvolvedores e especialistas do negócio.

- Evita ruídos de comunicação
- Deve ser usada em código, documentação e conversas
- Base para um bom alinhamento do time :contentReference[oaicite:1]{index=1}

---

## 🧩 Principais Elementos

### 🔸 Entidades (Entities)

Objetos com identidade única que mudam ao longo do tempo.

### 🔸 Objetos de Valor (Value Objects)

Objetos imutáveis definidos apenas por seus atributos (sem identidade própria).

### 🔸 Agregados (Aggregates)

Conjunto de objetos relacionados tratados como uma única unidade.

### 🔸 Repositórios (Repositories)

Responsáveis por armazenar e recuperar objetos do domínio.

### 🔸 Serviços (Services)

Representam operações que não pertencem naturalmente a uma entidade específica.

---

## 🗺️ Conceitos Estratégicos

### 🔹 Bounded Context (Contexto Delimitado)

Define **limites claros** dentro do sistema onde um modelo específico é válido.

- Evita conflitos de interpretação
- Permite dividir sistemas complexos

### 🔹 Context Mapping

Mostra como diferentes contextos se relacionam dentro do sistema.

---

## 🎯 Objetivos do DDD

- Melhorar a **comunicação entre negócio e tecnologia**
- Reduzir complexidade em sistemas grandes
- Criar software mais **coeso e sustentável**
- Entregar funcionalidades mais alinhadas com o valor de negócio :contentReference[oaicite:2]{index=2}

---

## ⚖️ Quando usar DDD

### ✅ Indicado para:

- Sistemas complexos
- Regras de negócio sofisticadas
- Projetos com múltiplos stakeholders

### ⚠️ Evitar quando:

- O sistema é simples (CRUD básico)
- A complexidade não justifica o esforço :contentReference[oaicite:3]{index=3}

---

## 💡 Boas Práticas

- Trabalhar junto com especialistas do domínio
- Manter o glossário sempre atualizado
- Refletir a linguagem do negócio no código
- Dividir claramente os contextos

---

## 🚀 Resumo Final

DDD não é uma tecnologia ou framework, mas sim uma **forma de pensar e projetar software** centrada no negócio.

Quando bem aplicado, ele transforma o sistema em um reflexo fiel da realidade do domínio, facilitando evolução, manutenção e entendimento por todo o time.

---
