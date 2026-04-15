Agora a gente entra no nível **arquitetura de verdade (DDD tático)** — identificar **Aggregates** no seu schema.

Vou te explicar:

1. 🔍 O que é Aggregate (rápido e direto)
2. 🧠 Como identificar no seu domínio
3. 🧱 Seus Aggregates reais (mapa completo)
4. ⚠️ Erros que você quase cometeu
5. 🚀 Como isso vira código (prático)

---

# 🧠 1. O que é um Aggregate (sem enrolação)

> Um **Aggregate** é um conjunto de entidades tratado como **uma unidade de consistência** ([Qlerify][1])

👉 E sempre tem um:

### 🎯 Aggregate Root

- ponto de entrada
- controla regras
- garante consistência ([Qlerify][2])

---

## 💡 Regra de ouro

> 🔥 "Nada acessa entidades internas sem passar pelo Root"

---

# 🧠 2. Como identificar Aggregate (heurística sênior)

Use essas 3 perguntas:

### 1. Isso precisa ser consistente junto?

(ex: sessão + bytes)

### 2. Isso muda junto?

(ex: voucher → status + usedAt)

### 3. Isso tem regra de negócio forte?

---

# 🧱 3. SEUS AGGREGATES (mapa completo)

Agora sim — analisando seu schema como arquiteto:

---

# 🏢 1. Organization Aggregate

## 🎯 Root

```ts
Organization;
```

## 🔗 Dentro

- Member
- Router
- HotspotPlan
- Voucher
- HotspotUser

## 💡 Por quê?

- tudo pertence ao tenant
- consistência organizacional

---

## ⚠️ IMPORTANTE

👉 NÃO carregar tudo junto (erro comum)

---

# 👤 2. User Aggregate

## 🎯 Root

```ts
User;
```

## 🔗 Dentro

- Address
- Account
- Token
- Otp

---

## 💡 Regra

Tudo relacionado à identidade do usuário

---

# 🔐 3. Auth Aggregate (separável)

## 🎯 Root

```ts
Account;
```

ou

```ts
User (dependendo do design)
```

---

## 💡 Insight sênior

👉 Em sistemas grandes:

- Auth vira outro microserviço

---

# 🌐 4. Hotspot Aggregate (CRÍTICO)

## 🎯 Root

```ts
HotspotUser;
```

## 🔗 Dentro

- Session

---

## 💡 Regras aqui

- usuário pode expirar
- sessões devem fechar corretamente
- consumo precisa bater

---

## 🔥 Esse é o CORE do seu sistema

---

# 📡 5. Router Aggregate

## 🎯 Root

```ts
Router;
```

## 🔗 Dentro

- Sessions (referência)
- HotspotUsers (referência)

---

## ⚠️ Aqui é importante:

👉 NÃO colocar tudo dentro do aggregate

---

# 💳 6. Billing Aggregate

## 🎯 Root

```ts
MercadoPagoConfig;
EfiConfig;
```

## 💡 Simples (config aggregate)

---

# 🎟️ 7. Voucher Aggregate

## 🎯 Root

```ts
Voucher;
```

## 💡 Regras

- só pode usar 1 vez
- expiração
- vínculo com plano

---

## ⚠️ Erro comum

Misturar Voucher com HotspotUser

👉 NÃO FAÇA ISSO

---

# 🔐 8. OTP Aggregate

## 🎯 Root

```ts
Otp;
```

## 💡 Regras

- expiração
- tentativa
- uso único

---

# 📡 9. Radius (FORA DO DOMÍNIO)

## ❌ NÃO É AGGREGATE

```ts
Radcheck;
Radreply;
Radusergroup;
```

👉 Infraestrutura pura

---

# 🧠 VISÃO FINAL (MAPA)

```bash
[Organization]
   ├── Member
   ├── Router
   ├── Plan
   ├── Voucher
   └── HotspotUser

[User]
   ├── Address
   ├── Account
   ├── Token
   └── Otp

[HotspotUser]
   └── Session

[Router]

[Voucher]

[Billing]

[Otp]
```

---

# ⚠️ ERROS QUE VOCÊ QUASE COMETEU

## ❌ 1. Aggregate gigante

```ts
Organization → tudo dentro
```

👉 errado (vira monstro)

---

## ❌ 2. Session fora do HotspotUser

👉 quebra consistência

---

## ❌ 3. Misturar Radius

👉 acoplamento forte

---

## ❌ 4. Relacionar tudo com tudo

👉 viola isolamento

---

# 🧠 4. Como isso vira código (EXEMPLO REAL)

## ❌ ERRADO (anêmico)

```ts
hotspotUser.status = 'ACTIVE';
```

---

## ✅ CERTO (Aggregate Root)

```ts
class HotspotUser {
  activate() {
    if (this.status === 'BLOCKED') {
      throw new Error('Usuário bloqueado');
    }

    this.status = 'ACTIVE';
  }
}
```

---

# 🧠 5. Complexidade (impacto real)

## Antes (sem aggregate)

- inconsistência
- bugs
- regras espalhadas

## Depois

- consistência garantida
- lógica centralizada

---

## 💡 Complexidade

| Operação              | Complexidade         |
| --------------------- | -------------------- |
| validação local       | O(1)                 |
| com aggregate correto | O(1)                 |
| sem aggregate         | O(n) (caçando dados) |

---

# 🚀 Insight de arquiteto (muito importante)

👉 Aggregate NÃO segue tabela
👉 Aggregate segue REGRA DE NEGÓCIO

---

# 🎯 Conclusão

Você tem **~8 aggregates claros**:

1. Organization
2. User
3. HotspotUser ⭐ (core)
4. Router
5. Voucher
6. Billing
7. OTP
8. (Radius fora)

---

# 🔥 Próximo nível (se quiser)

Posso te ajudar a:

- Transformar isso em **código real (entities + aggregates)**
- Criar **Repository Pattern correto**
- Aplicar **Use Cases (Clean Architecture)**

Só falar 👇

[1]: https://www.qlerify.com/dddconcepts/aggregate?utm_source=chatgpt.com 'What is an Aggregate? | Domain Driver Design Glossary | Qlerify'
[2]: https://www.qlerify.com/dddconcepts/aggregate-root?utm_source=chatgpt.com 'What is an Aggregate Root? | Domain Driver Design Glossary | Qlerify'
