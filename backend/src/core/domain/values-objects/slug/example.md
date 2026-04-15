# 🧪 Exemplo Prático de Uso

```ts
// Criar a partir de texto comum (auto normaliza)
const slug1 = SlugVO.createFromText('Curso de TypeScript Avançado!')
console.log(slug1.getValue()) // 'curso-de-typescript-avancado'

// Criar a partir de string já formatada
const slug2 = SlugVO.create('curso-de-typescript-avancado')

// Comparar (herda equals da classe base)
console.log(slug1.equals(slug2)) // true

// Serializar
console.log(JSON.stringify({ slug: slug1 })) // { "slug": "curso-de-typescript-avancado" }

// Exemplo de erro
try {
  SlugVO.createFromText('a!')
} catch (err) {
  console.error(err.message) // Slug must be at least 3 characters.
}

```
