# 🔹 Exemplo completo de uso

```ts
import { PriceUtils } from './PriceUtils'

// ========================
// 1️⃣ Formatar valores como moeda
// ========================
const precoProduto = 1234.56
console.log(PriceUtils.format(precoProduto))
// Saída: "R$ 1.234,56" (formato brasileiro padrão)
console.log(PriceUtils.format(precoProduto, 'USD', 'en-US'))
// Saída: "$1,234.56" (formato americano)

// ========================
// 2️⃣ Aplicar desconto
// ========================
const precoOriginal = 200
const precoComDesconto = PriceUtils.applyDiscount(precoOriginal, 15)
console.log(precoComDesconto)
// Saída: 170.00 (15% de desconto aplicado)

try {
  PriceUtils.applyDiscount(precoOriginal, 150)
  // Erro: Percentual de desconto deve estar entre 0 e 100
} catch (err) {
  console.error(err.message)
}

// ========================
// 3️⃣ Somar múltiplos preços
// ========================
const carrinho = [49.90, 120.50, 15.99]
const totalCarrinho = PriceUtils.sum(...carrinho)
console.log(totalCarrinho)
// Saída: 186.39 (soma com precisão)

// ========================
// 4️⃣ Converter valores entre moedas
// ========================
const precoEmBRL = 100
const taxaDolar = 0.20 // 1 BRL = 0.20 USD
const precoEmUSD = PriceUtils.convert(precoEmBRL, taxaDolar)
console.log(precoEmUSD)
// Saída: 20.00

// ========================
// 5️⃣ Aplicar imposto
// ========================
const precoSemImposto = 100
const precoComImposto = PriceUtils.applyTax(precoSemImposto, 18)
console.log(precoComImposto)
// Saída: 118.00 (18% de imposto aplicado)

// ========================
// 6️⃣ Remover imposto embutido
// ========================
const precoComImposto2 = 118
const precoBase = PriceUtils.removeTax(precoComImposto2, 18)
console.log(precoBase)
// Saída: 100.00 (valor original sem imposto)

// ========================
// 7️⃣ Combinação de operações (cenário real)
// ========================
const precoProduto2 = 500
const desconto = 10
const imposto = 18

// Aplicar desconto e depois imposto
const precoFinal = PriceUtils.applyTax(
  PriceUtils.applyDiscount(precoProduto2, desconto),
  imposto
)
console.log(precoFinal)
// Saída: 531.00

```
