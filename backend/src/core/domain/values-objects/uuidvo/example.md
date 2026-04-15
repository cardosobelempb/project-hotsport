# 🧪 Exemplo Prático de Uso

```ts
// Criar novo UUID automaticamente
const id1 = UUIDVO.create()
console.log(id1.getValue()) // ex: "b3e1f3b2-45cd-47b5-bb67-91ef3b0f6c27"

// Criar a partir de um UUID existente
const id2 = UUIDVO.create('urn:uuid:b3e1f3b2-45cd-47b5-bb67-91ef3b0f6c27')

// Comparar (herda equals da classe base)
console.log(id1.equals(id2)) // true

// Serializar
console.log(JSON.stringify({ userId: id1 })) // { "userId": "b3e1f3b2-45cd-47b5-bb67-91ef3b0f6c27" }

// Tentar criar com UUID inválido
try {
  UUIDVO.create('invalid-uuid')
} catch (err) {
  console.error(err.message) // Invalid UUIDv4 format: "invalid-uuid"
}

```
