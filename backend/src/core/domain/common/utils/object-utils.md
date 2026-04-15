# 📘 EXEMPLOS DE USO (com explicações)

## 🧬 1. deepClone — Clonagem profunda

```ts
const user = {
  name: "Ana",
  contact: { email: "ana@email.com" },
}

const clone = ObjectUtils.deepClone(user)

// Prova de deep clone:
clone.contact.email = "novo@email.com"

console.log(user.contact.email)
// "ana@email.com"

```

## 🧪 2. convertToPlainObject — limpar funções e protótipos
- Função e instância Date são convertidas para string, conforme padrão JSON.

```ts
const obj = {
  name: "Luiz",
  createdAt: new Date(),
  sayHello() {},
}

const plain = ObjectUtils.convertToPlainObject(obj)

console.log(plain)
// { name: "Luiz", createdAt: "2025-02-01T..." }

```

## 📦 3. isObject — detectar apenas objetos simples

```ts
ObjectUtils.isObject({})           // true
ObjectUtils.isObject([])           // false
ObjectUtils.isObject(null)         // false
ObjectUtils.isObject(new Date())   // false
ObjectUtils.isObject("teste")      // false

```

## 🕳️ 4. isEmpty — detectar vazio de forma inteligente

```ts
ObjectUtils.isEmpty(null)          // true
ObjectUtils.isEmpty(undefined)     // true
ObjectUtils.isEmpty([])            // true
ObjectUtils.isEmpty({})            // true
ObjectUtils.isEmpty({ a: 1 })      // false
ObjectUtils.isEmpty([1])           // false
ObjectUtils.isEmpty("texto")       // false

```

## 🔀 5. mergeDeep — merge profundo real

```ts
const base = {
  config: {
    theme: "light",
    lang: "en",
  },
  user: {
    name: "Ana",
    roles: ["admin"],
  },
}

const override = {
  config: {
    lang: "pt",
  },
  user: {
    roles: ["editor"],
  },
}

const merged = ObjectUtils.mergeDeep(base, override)

console.log(merged)
/*
{
  config: { theme: "light", lang: "pt" },
  user: { name: "Ana", roles: ["editor"] }
}
*/

```
