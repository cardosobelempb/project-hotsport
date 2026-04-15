# 📘 EXEMPLOS DE USO (Didáticos e Reais)

## 🎲 1. Gerando senhas

```ts
PasswordUtils.generatePassword()
// ex: "fT9!aL0@xPqz"

PasswordUtils.generatePassword(16, true, true, false)
// ex: "AbcDEfgHIjkLMnop"

```

## 🔍 2. Validando requisitos mínimos

```ts
PasswordUtils.validatePassword("Fraca123")
// false — falta símbolo

PasswordUtils.validatePassword("Forte123!")
// true

```

## 📊 3. Avaliando força

```ts
PasswordUtils.getPasswordStrength("abc")
// "Fraca"

PasswordUtils.getPasswordStrength("Ana1234")
// "Média"

PasswordUtils.getPasswordStrength("A1!bcdefgh")
// "Forte"


```
## 🔐 4. Gerando hash da senha

```ts
const password = "MinhaSenhaForte!123"

const hashed = await passwordUtils.hash(password)

console.log(hashed)
// "$argon2id$v=19$m=4096,t=3,p=1$..."


```
## 🔑 5. Comparando hash

```ts
const isValid = await passwordUtils.compare("MinhaSenhaForte!123", hashed)

console.log(isValid) // true

```

