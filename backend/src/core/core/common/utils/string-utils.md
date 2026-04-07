## 🔹 Exemplos de uso

```ts
// ========================
// 1️⃣ Checagem de string
// ========================
console.log(StringUtils.isBlank(''))           // true
console.log(StringUtils.isBlank('  '))        // true
console.log(StringUtils.isNotBlank('texto'))  // true

// ========================
// 2️⃣ Capitalização
// ========================
console.log(StringUtils.capitalize('cláudio cardoso')) // "Cláudio cardoso"
console.log(StringUtils.capitalize(''))               // undefined

// ========================
// 3️⃣ Remover acentos e criar slug
// ========================
console.log(StringUtils.removeAccents('Olá Mundo!'))  // "Ola Mundo!"
console.log(StringUtils.toSlug('Olá Mundo!'))        // "ola-mundo"

// ========================
// 4️⃣ Truncar string
// ========================
console.log(StringUtils.truncate('Exemplo de texto longo', 10)) // "Exemplo de..."

// ========================
// 5️⃣ Contar ocorrências
// ========================
console.log(StringUtils.countOccurrences('banana', 'a')) // 3

// ========================
// 6️⃣ Inverter string
// ========================
console.log(StringUtils.reverse('abc')) // "cba"

// ========================
// 7️⃣ Validar e-mail e URL
// ========================
console.log(StringUtils.isValidEmail('teste@dominio.com')) // true
console.log(StringUtils.isValidURL('https://google.com')) // true

// ========================
// 8️⃣ Validar CPF e CNPJ
// ========================
console.log(StringUtils.isValidCPF('123.456.789-09')) // false
console.log(StringUtils.isValidCNPJ('11.444.777/0001-61')) // true

// ========================
// 9️⃣ Conversão de cases
// ========================
console.log(StringUtils.toCamelCase('hello_world-test')) // "helloWorldTest"
console.log(StringUtils.toSnakeCase('HelloWorld Test'))  // "hello_world_test"
console.log(StringUtils.toKebabCase('HelloWorld Test'))  // "hello-world-test"

// ========================
// 🔟 Gerar strings aleatórias
// ========================
console.log(StringUtils.generateRandomString(8))       // exemplo: "A1b2C3d4"
console.log(StringUtils.generateSecureRandomString(8)) // exemplo: "G5h8K0Q2"

// ========================
// 1️⃣1️⃣ Obter iniciais
// ========================
console.log(StringUtils.getInitials('Cláudio Cardoso')) // "CC"

```
